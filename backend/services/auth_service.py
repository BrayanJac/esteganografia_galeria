from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from database.models import User, UserRole, SecurityLog
from security.auth import *


def _log_security_event(
    db: Session,
    event_type: str,
    description: str,
    user_id: int | None,
    ip_address: str,
    user_agent: str,
    severity: str = "INFO",
):
    db.add(SecurityLog(
        event_type=event_type,
        description=description,
        user_id=user_id,
        ip_address=ip_address,
        user_agent=user_agent,
        severity=severity,
    ))


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
    usuario = autenticar_usuario(
        db, username, password, ip_address, user_agent)

    if not usuario:
        usuario_bloqueado = db.query(User).filter(User.username == username).first()
        if usuario_bloqueado and not usuario_bloqueado.is_active and usuario_bloqueado.failed_login_attempts >= LOGIN_ATTEMPTS_LIMIT:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario bloqueado por demasiados intentos fallidos. Contacte al administrador."
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales inválidas"
        )

    access_token = crear_token_acceso(data={"sub": usuario.username})

    _log_security_event(
        db,
        event_type="AUTH_LOGIN",
        description="Inicio de sesión exitoso",
        user_id=usuario.id,
        ip_address=ip_address,
        user_agent=user_agent,
        severity="INFO",
    )
    db.commit()

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


async def logout_user(user: User, db: Session, ip_address: str, user_agent: str):
    _log_security_event(
        db,
        event_type="AUTH_LOGOUT",
        description="Cierre de sesión",
        user_id=user.id,
        ip_address=ip_address,
        user_agent=user_agent,
        severity="INFO",
    )
    db.commit()

    return {"mensaje": "Sesión cerrada exitosamente"}


async def create_supervisor(username: str, email: str, password: str, db: Session):
    """Create a new supervisor. Only callable by superadmin."""
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

    nuevo_supervisor = User(
        username=username,
        email=email,
        password_hash=password_hash,
        salt=salt,
        role=UserRole.SUPERVISOR
    )

    db.add(nuevo_supervisor)
    db.commit()
    db.refresh(nuevo_supervisor)

    return {
        "mensaje": "Supervisor creado exitosamente",
        "supervisor": {
            "id": nuevo_supervisor.id,
            "username": nuevo_supervisor.username,
            "email": nuevo_supervisor.email,
            "role": nuevo_supervisor.role.value
        }
    }


async def delete_supervisor(supervisor_id: int, db: Session):
    """Delete a supervisor. Only callable by superadmin."""
    supervisor = db.query(User).filter(User.id == supervisor_id).first()

    if not supervisor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supervisor no encontrado"
        )

    if supervisor.role != UserRole.SUPERVISOR:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El usuario no es un supervisor"
        )

    db.delete(supervisor)
    db.commit()

    return {"mensaje": f"Supervisor {supervisor.username} eliminado exitosamente"}


async def delete_user(user_id: int, db: Session):
    """Delete a user. Only callable by superadmin."""
    from database.models import LoginAttempt

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    if user.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede eliminar al superadmin"
        )

    # Check if user has albums
    if user.albums:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El usuario tiene {len(user.albums)} álbume(s) asociado(s). Elimina primero los álbumes."
        )

    # Delete related login attempts first to avoid foreign key constraint violation
    db.query(LoginAttempt).filter(LoginAttempt.user_id == user_id).delete()

    # Now delete the user
    db.delete(user)
    db.commit()

    return {"mensaje": f"Usuario {user.username} eliminado exitosamente"}


async def get_supervisors(db: Session):
    """Get all supervisors. Only callable by superadmin."""
    supervisors = db.query(User).filter(User.role == UserRole.SUPERVISOR).all()

    return {
        "supervisors": [
            {
                "id": supervisor.id,
                "username": supervisor.username,
                "email": supervisor.email,
                "role": supervisor.role.value,
                "is_active": supervisor.is_active,
                "created_at": supervisor.created_at.isoformat() if supervisor.created_at else None
            }
            for supervisor in supervisors
        ]
    }


async def get_users(db: Session):
    """Get all users (excluding supervisors and admins). Only callable by superadmin."""
    users = db.query(User).filter(User.role == UserRole.USER).all()

    return {
        "users": [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role.value,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "album_count": len(user.albums) if user.albums else 0
            }
            for user in users
        ]
    }
