from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from database.models import User, UserRole
from security.auth import *

async def register_user(username: str, email: str, password: str, db: Session, ip_address: str):
    es_valido, mensaje = validar_fuerza_contraseña(password)
    if not es_valido:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=mensaje
        )
    
    usuario_existente = db.query(User).filter(
        (User.username == username) | (User.email == email)
    ).first()
    
    if usuario_existente:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El nombre de usuario o email ya existe"
        )
    
    salt = generar_salt()
    password_hash = get_password_hash(password)
    
    nuevo_usuario = User(
        username=username,
        email=email,
        password_hash=password_hash,
        salt=salt,
        role=UserRole.USER
    )
    
    db.add(nuevo_usuario)
    db.commit()
    
    return {"mensaje": "Usuario registrado exitosamente"}

async def authenticate_user(username: str, password: str, db: Session, ip_address: str, user_agent: str):
    usuario = autenticar_usuario(db, username, password, ip_address, user_agent)
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas"
        )
    
    access_token = crear_token_acceso(data={"sub": usuario.username})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": {
            "id": usuario.id,
            "username": usuario.username,
            "email": usuario.email,
            "role": usuario.role.value
        }
    }
