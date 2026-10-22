#!/usr/bin/env python3
"""Genera la lista exacta (nombre==versión) de las dependencias de ejecución del proyecto.

Parte de backend/requirements.txt y recorre sus dependencias transitivas instaladas,
dejando fuera las herramientas de prueba (pytest, bandit, pip-audit...). Así el análisis
de dependencias (SCA) revisa solo lo que realmente usa la aplicación.
Uso: congelar_dependencias.py <requirements.txt> > lock.txt
"""
import re
import sys
from importlib import metadata

from packaging.requirements import Requirement
from packaging.utils import canonicalize_name


def nombres_iniciales(ruta):
    for linea in open(ruta, encoding="utf-8"):
        linea = linea.split("#")[0].strip()
        if linea:
            yield Requirement(linea)


def main(ruta):
    cola = [(canonicalize_name(r.name), set(r.extras)) for r in nombres_iniciales(ruta)]
    vistos, versiones = set(), {}
    while cola:
        nombre, extras = cola.pop()
        clave = (nombre, frozenset(extras))
        if clave in vistos:
            continue
        vistos.add(clave)
        try:
            dist = metadata.distribution(nombre)
        except metadata.PackageNotFoundError:
            print(f"# no instalado: {nombre}", file=sys.stderr)
            continue
        versiones[nombre] = dist.version
        for texto in dist.requires or []:
            req = Requirement(texto)
            if req.marker is None or any(req.marker.evaluate({"extra": e}) for e in (extras or {""})):
                cola.append((canonicalize_name(req.name), set(req.extras)))
    for nombre in sorted(versiones):
        print(f"{nombre}=={versiones[nombre]}")


if __name__ == "__main__":
    main(sys.argv[1])
