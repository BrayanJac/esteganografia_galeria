#!/usr/bin/env python3
"""Consolida la evidencia de una corrida, quita duplicados y decide si el pipeline pasa.

Uso:
  security_gate.py evaluar  <carpeta_evidencia> [--exceptions exceptions.json] [--sin-excepciones]
  security_gate.py comparar <carpeta_antes> <carpeta_despues>
"""
import argparse
import json
import re
import sys
import xml.etree.ElementTree as ET
from datetime import date
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
CAMPOS_EXCEPCION = ("id", "caso", "motivo", "mitigacion", "aprobado_por", "vence")


def leer_json(ruta):
    p = Path(ruta)
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else None


def relativo(ruta):
    try:
        return str(Path(ruta).resolve().relative_to(RAIZ))
    except ValueError:
        return str(ruta)


def normalizar_bandit(data):
    unicos, duplicados = {}, 0
    for r in (data or {}).get("results", []):
        clave = (r["test_id"], relativo(r["filename"]), r["line_number"])
        if clave in unicos:
            duplicados += 1
            continue
        unicos[clave] = {
            "herramienta": "bandit", "id": r["test_id"], "titulo": r["test_name"],
            "severidad": r["issue_severity"], "confianza": r["issue_confidence"],
            "ubicacion": f"{relativo(r['filename'])}:{r['line_number']}"}
    return list(unicos.values()), duplicados


def normalizar_pip_audit(data):
    unicos, duplicados = {}, 0
    for dep in (data or {}).get("dependencies", []):
        for v in dep.get("vulns", []):
            cve = next((a for a in [v["id"], *v.get("aliases", [])] if a.startswith("CVE-")), v["id"])
            clave = (dep["name"].lower(), cve)
            if clave in unicos:
                duplicados += 1
                continue
            unicos[clave] = {
                "herramienta": "pip-audit", "id": cve, "titulo": f"{dep['name']} {dep['version']}",
                "severidad": "N/D", "confianza": "N/D", "ubicacion": dep["name"],
                "corregido_en": v.get("fix_versions", [])}
    return list(unicos.values()), duplicados


def leer_pruebas(ruta):
    pruebas = []
    if not Path(ruta).exists():
        return pruebas
    for tc in ET.parse(ruta).getroot().iter("testcase"):
        if tc.find("failure") is not None or tc.find("error") is not None:
            estado = "FALLA"
        elif tc.find("skipped") is not None:
            estado = "OMITIDA"
        else:
            estado = "PASA"
        m = re.match(r"test_([A-Z]+)_(\d+)_", tc.get("name", ""))
        pruebas.append({"nombre": tc.get("name"), "caso": f"{m.group(1)}-{m.group(2)}" if m else None,
                        "estado": estado})
    return pruebas


def evaluar_excepciones(ruta, ignorar):
    problemas, vigentes = [], {}
    if ignorar or not Path(ruta).exists():
        return vigentes, problemas
    for e in json.loads(Path(ruta).read_text(encoding="utf-8")).get("excepciones", []):
        faltan = [c for c in CAMPOS_EXCEPCION if not str(e.get(c, "")).strip()]
        if faltan:
            problemas.append(f"{e.get('id', '?')}: excepción sin campos obligatorios {faltan}")
            continue
        if date.fromisoformat(e["vence"]) < date.today():
            problemas.append(f"{e['id']}: excepción vencida el {e['vence']}")
            continue
        vigentes[e["caso"]] = e
    return vigentes, problemas


def evaluar(carpeta, ruta_exc, ignorar):
    carpeta = Path(carpeta)
    pruebas = leer_pruebas(carpeta / "pytest_junit.xml")
    bandit, dup_b = normalizar_bandit(leer_json(carpeta / "bandit.json"))
    audit, dup_a = normalizar_pip_audit(leer_json(carpeta / "pip_audit.json"))
    vigentes, fallos = evaluar_excepciones(ruta_exc, ignorar)
    avisos = []

    # G1: pruebas fallidas
    for t in pruebas:
        if t["estado"] == "FALLA":
            if t["caso"] in vigentes:
                avisos.append(f"{t['caso']} falla pero tiene excepción {vigentes[t['caso']]['id']}")
            else:
                fallos.append(f"G1 prueba fallida: {t['nombre']}")
    # G4: excepción obsoleta (el caso ya pasa)
    for caso, e in vigentes.items():
        if any(t["caso"] == caso and t["estado"] == "PASA" for t in pruebas):
            fallos.append(f"G4 excepción {e['id']} obsoleta: {caso} ya pasa, hay que retirarla")
    # G2: Bandit
    for h in bandit:
        if h["severidad"] == "HIGH" or (h["severidad"] == "MEDIUM" and h["confianza"] == "HIGH"):
            if f"{h['id']}:{h['ubicacion'].split(':')[0]}" in vigentes:
                avisos.append(f"Bandit {h['id']} en {h['ubicacion']} con excepción")
            else:
                fallos.append(f"G2 Bandit {h['severidad']}/{h['confianza']} {h['id']} en {h['ubicacion']}")
        else:
            avisos.append(f"Bandit {h['severidad']}/{h['confianza']} {h['id']} en {h['ubicacion']} (candidato a revisión manual)")
    # G3: pip-audit, agrupado por paquete (la excepción se pide por paquete: caso "SCA:<paquete>")
    por_paquete = {}
    for h in audit:
        por_paquete.setdefault(h["ubicacion"], []).append(h)
    for paquete, hs in sorted(por_paquete.items()):
        con_fix = [h for h in hs if h["corregido_en"]]
        version = hs[0]["titulo"]
        if not con_fix:
            avisos.append(f"{version}: {len(hs)} vulnerabilidad(es) sin versión corregida disponible")
        elif f"SCA:{paquete}" in vigentes:
            avisos.append(f"{version}: {len(con_fix)} vulnerabilidad(es) con excepción {vigentes[f'SCA:{paquete}']['id']}")
        else:
            fallos.append(f"G3 {version}: {len(con_fix)} vulnerabilidad(es) con corrección disponible (p. ej. {con_fix[0]['id']})")

    resumen = {
        "pruebas": pruebas,
        "totales": {
            "pruebas": len(pruebas),
            "pasan": sum(t["estado"] == "PASA" for t in pruebas),
            "fallan": sum(t["estado"] == "FALLA" for t in pruebas),
            "bandit_unicos": len(bandit), "bandit_duplicados_removidos": dup_b,
            "pip_audit_unicos": len(audit), "pip_audit_duplicados_removidos": dup_a},
        "hallazgos_candidatos": bandit + audit,
        "fallos_del_gate": fallos, "avisos": avisos,
        "resultado": "FALLA" if fallos else "PASA"}
    (carpeta / "resumen.json").write_text(json.dumps(resumen, indent=2, ensure_ascii=False), encoding="utf-8")

    t = resumen["totales"]
    md = [f"# Resumen de la corrida: {carpeta.name}", "",
          f"Resultado del pipeline: {resumen['resultado']}", "",
          f"Pruebas: {t['pasan']} pasan, {t['fallan']} fallan de {t['pruebas']}.",
          f"Bandit: {t['bandit_unicos']} alertas únicas ({t['bandit_duplicados_removidos']} duplicadas removidas).",
          f"pip-audit: {t['pip_audit_unicos']} vulnerabilidades únicas ({t['pip_audit_duplicados_removidos']} duplicadas removidas).", ""]
    md += ["## Motivos de falla del gate", *([f"- {f}" for f in fallos] or ["- ninguno"]), "",
           "## Avisos (no bloquean)", *([f"- {a}" for a in avisos] or ["- ninguno"]), ""]
    (carpeta / "resumen.md").write_text("\n".join(md), encoding="utf-8")
    print("\n".join(md))
    return 1 if fallos else 0


def comparar(antes, despues):
    a, d = (json.loads((Path(p) / "resumen.json").read_text(encoding="utf-8")) for p in (antes, despues))
    ea = {t["nombre"]: t["estado"] for t in a["pruebas"]}
    ed = {t["nombre"]: t["estado"] for t in d["pruebas"]}
    filas = ["| Prueba | Antes | Después |", "|---|---|---|"]
    for n in sorted(set(ea) | set(ed)):
        filas.append(f"| {n} | {ea.get(n, '-')} | {ed.get(n, '-')} |")
    ta, td = a["totales"], d["totales"]
    salida = ["# Resultados antes y después", "",
              f"Antes: {ta['pasan']} pasan y {ta['fallan']} fallan. Pipeline: {a['resultado']}.",
              f"Después: {td['pasan']} pasan y {td['fallan']} fallan. Pipeline: {d['resultado']}.", "", *filas, ""]
    texto = "\n".join(salida)
    print(texto)
    return texto


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    e = sub.add_parser("evaluar")
    e.add_argument("carpeta")
    e.add_argument("--exceptions", default=str(Path(__file__).with_name("exceptions.json")))
    e.add_argument("--sin-excepciones", action="store_true")
    c = sub.add_parser("comparar")
    c.add_argument("antes")
    c.add_argument("despues")
    args = ap.parse_args()
    if args.cmd == "evaluar":
        sys.exit(evaluar(args.carpeta, args.exceptions, args.sin_excepciones))
    comparar(args.antes, args.despues)
