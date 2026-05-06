from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session
from database.database import get_db
from database.models import User
from security.auth import get_current_user, require_supervisor_or_admin
from services.image_service import upload_image, get_quarantined_images, review_image

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

@router.post("/upload")
@limiter.limit("10/hour")
async def upload_image_endpoint(
    request: Request,
    album_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await upload_image(album_id, file, current_user.id, db, get_remote_address(request))

@router.get("/quarantined")
async def get_quarantined_images_endpoint(current_user: User = Depends(require_supervisor_or_admin), db: Session = Depends(get_db)):
    return await get_quarantined_images(db)

@router.post("/{image_id}/review")
async def review_image_endpoint(
    image_id: int,
    approved: bool,
    comment: str = None,
    current_user: User = Depends(require_supervisor_or_admin),
    db: Session = Depends(get_db)
):
    return await review_image(image_id, approved, comment, current_user.id, db)
