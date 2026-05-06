from fastapi import APIRouter, Depends, HTTPException, status, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import User
from security.auth import get_current_user, require_supervisor_or_admin
from services.auth_service import register_user, authenticate_user

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/register")
@limiter.limit("5/minute")
async def register(request: Request, username: str, email: str, password: str, db: Session = Depends(get_db)):
    return await register_user(username, email, password, db, get_remote_address(request))

@router.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, username: str, password: str, db: Session = Depends(get_db)):
    return await authenticate_user(username, password, db, get_remote_address(request), request.headers.get("user-agent", ""))

@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role.value,
        "is_active": current_user.is_active
    }
