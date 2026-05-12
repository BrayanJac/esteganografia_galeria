from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import User, UserRole
from security.auth import require_exact_role
from services.admin_service import get_admin_statistics, get_users_list, get_albums_list, get_events, get_user_activity

router = APIRouter()


@router.get("/stats")
async def get_stats_endpoint(
    current_user: User = Depends(require_exact_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    return get_admin_statistics(db)


@router.get('/users')
async def get_users(
    current_user: User = Depends(require_exact_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    return get_users_list(db)


@router.get('/albums')
async def get_albums(
    current_user: User = Depends(require_exact_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    return get_albums_list(db)


@router.get('/events')
async def get_events_endpoint(
    direction: str | None = None,
    current_user: User = Depends(require_exact_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    return get_events(db, direction)


@router.get('/users/{user_id}/activity')
async def get_user_activity_endpoint(
    user_id: int,
    current_user: User = Depends(require_exact_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    return get_user_activity(db, user_id)


@router.post('/users/{user_id}/unlock')
async def unlock_user_endpoint(
    user_id: int,
    current_user: User = Depends(require_exact_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    """Unlock a blocked user account."""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    user.is_active = True
    user.failed_login_attempts = 0
    db.commit()
    db.refresh(user)
    
    return {
        "mensaje": "Usuario desbloqueado exitosamente",
        "usuario": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_active": user.is_active,
            "failed_login_attempts": user.failed_login_attempts
        }
    }
