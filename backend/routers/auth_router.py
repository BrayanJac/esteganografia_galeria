from fastapi import APIRouter, Depends, HTTPException, status, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import User, UserRole
from security.auth import get_current_user, require_supervisor_or_admin, require_exact_role
from services.auth_service import register_user, authenticate_user, logout_user, create_supervisor, delete_supervisor, delete_user, get_supervisors, get_users
from schemas.auth_schemas import RegisterRequest, LoginRequest, CreateSupervisorRequest, DeleteUserRequest

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/register")
@limiter.limit("5/minute")
async def register(request: Request, data: RegisterRequest, db: Session = Depends(get_db)):
    return await register_user(data.username, data.email, data.password, db, get_remote_address(request))


@router.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, data: LoginRequest, db: Session = Depends(get_db)):
    return await authenticate_user(data.username, data.password, db, get_remote_address(request), request.headers.get("user-agent", ""))


@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email,
        "role": current_user.role.value,
        "is_active": current_user.is_active
    }


@router.post("/logout")
async def logout(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await logout_user(
        current_user,
        db,
        get_remote_address(request),
        request.headers.get("user-agent", ""),
    )


@router.post("/supervisors")
async def create_supervisor_endpoint(
    data: CreateSupervisorRequest,
    current_user: User = Depends(require_exact_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Create a new supervisor. Only for superadmin."""
    return await create_supervisor(data.username, data.email, data.password, db)


@router.get("/supervisors")
async def get_supervisors_endpoint(
    current_user: User = Depends(require_exact_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Get all supervisors. Only for superadmin."""
    return await get_supervisors(db)


@router.get("/users")
async def get_users_endpoint(
    current_user: User = Depends(require_exact_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Get all users. Only for superadmin."""
    return await get_users(db)


@router.delete("/supervisors/{supervisor_id}")
async def delete_supervisor_endpoint(
    supervisor_id: int,
    current_user: User = Depends(require_exact_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Delete a supervisor. Only for superadmin."""
    return await delete_supervisor(supervisor_id, db)


@router.delete("/users/{user_id}")
async def delete_user_endpoint(
    user_id: int,
    current_user: User = Depends(require_exact_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Delete a user. Only for superadmin."""
    return await delete_user(user_id, db)
