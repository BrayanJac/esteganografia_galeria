from datetime import datetime, timedelta
from typing import Optional
import secrets
import re
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from database.models import User, LoginAttempt, UserRole
from database.database import get_db
from config.config import *

pwd_context = CryptContext(
    schemes=["argon2", "pbkdf2_sha256"], deprecated="auto")
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def generar_salt() -> str:
    return secrets.token_hex(16)


def validar_fuerza_contraseña(password: str) -> tuple[bool, str]:
    errors = []

    if len(password) < PASSWORD_MIN_LENGTH:
        errors.append(
            f"La contraseña debe tener al menos {PASSWORD_MIN_LENGTH} caracteres")

    if PASSWORD_REQUIRE_UPPERCASE and not re.search(r'[A-Z]', password):
        errors.append(
            "La contraseña debe contener al menos una letra mayúscula")

    if PASSWORD_REQUIRE_LOWERCASE and not re.search(r'[a-z]', password):
        errors.append(
            "La contraseña debe contener al menos una letra minúscula")

    if PASSWORD_REQUIRE_NUMBERS and not re.search(r'\d', password):
        errors.append("La contraseña debe contener al menos un número")

    if PASSWORD_REQUIRE_SPECIAL and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        errors.append(
            "La contraseña debe contener al menos un carácter especial")

    if errors:
        return False, "; ".join(errors)

    return True, "La contraseña cumple con los requisitos de seguridad"


def crear_token_acceso(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None


def autenticar_usuario(db: Session, username: str, password: str, ip_address: str, user_agent: str) -> Optional[User]:
    user = db.query(User).filter(User.username == username).first()

    login_attempt = LoginAttempt(
        user_id=user.id if user else None,
        ip_address=ip_address,
        user_agent=user_agent,
        success=False
    )

    if not user or not user.is_active:
        db.add(login_attempt)
        db.commit()
        return None

    if not verify_password(password, user.password_hash):
        user.failed_login_attempts += 1
        user.last_login_attempt = datetime.utcnow()

        if user.failed_login_attempts >= LOGIN_ATTEMPTS_LIMIT:
            user.is_active = False

        db.add(login_attempt)
        db.commit()
        return None

    login_attempt.success = True
    user.failed_login_attempts = 0
    user.last_login_attempt = datetime.utcnow()

    db.add(login_attempt)
    db.commit()

    return user


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = credentials.credentials
        payload = verify_token(token)
        if payload is None:
            raise credentials_exception

        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La cuenta está bloqueada"
        )

    return user


def require_role(required_role: UserRole):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        # Normalize role comparison to handle cases where role is stored
        # as Enum or as string (DB inconsistencies). Compare by name/value lowercased.
        user_role = current_user.role
        if hasattr(user_role, 'value'):
            role_name = str(user_role.value).lower()
        else:
            role_name = str(user_role).lower()

        required_name = required_role.value.lower() if hasattr(
            required_role, 'value') else str(required_role).lower()
        admin_name = UserRole.ADMIN.value.lower()

        if role_name != required_name and role_name != admin_name:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permisos insuficientes"
            )
        return current_user
    return role_checker


def require_exact_role(required_role: UserRole):
    """Require the user to have exactly the given role (no admin override)."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role = current_user.role
        if hasattr(user_role, 'value'):
            role_name = str(user_role.value).lower()
        else:
            role_name = str(user_role).lower()

        required_name = required_role.value.lower() if hasattr(
            required_role, 'value') else str(required_role).lower()

        if role_name != required_name:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permisos insuficientes"
            )

        return current_user
    return role_checker


def require_supervisor_or_admin(current_user: User = Depends(get_current_user)) -> User:
    # Accept Enum members or plain strings stored in DB (case-insensitive)
    user_role = current_user.role
    if hasattr(user_role, 'value'):
        role_name = str(user_role.value).lower()
    else:
        role_name = str(user_role).lower()

    if role_name not in [UserRole.SUPERVISOR.value.lower(), UserRole.ADMIN.value.lower()]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requiere acceso de supervisor o administrador"
        )
    return current_user
