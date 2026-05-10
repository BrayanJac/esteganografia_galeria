from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.database import get_db
from database.models import User, UserRole
from security.auth import require_exact_role
from services.admin_service import get_admin_statistics

router = APIRouter()


@router.get("/stats")
async def get_stats_endpoint(
    current_user: User = Depends(require_exact_role(UserRole.ADMIN)),
    db: Session = Depends(get_db)
):
    return get_admin_statistics(db)
