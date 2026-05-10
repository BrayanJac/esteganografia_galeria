from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session
from typing import Annotated
from database.database import get_db
from database.models import User
from security.auth import get_current_user, require_supervisor_or_admin
from services.image_service import upload_image, get_quarantined_images, review_image
from schemas.image_schemas import ReviewImageRequest

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/upload")
async def upload_image_endpoint(
    album_id: Annotated[int, Form(...)],
    file: Annotated[UploadFile, File(...)],
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    return await upload_image(album_id, file, current_user.id, db)


@router.get("/quarantined")
async def get_quarantined_images_endpoint(
    current_user: Annotated[User, Depends(require_supervisor_or_admin)],
    db: Annotated[Session, Depends(get_db)]
):
    return get_quarantined_images(db)


@router.post("/{image_id}/review")
async def review_image_endpoint(
    image_id: int,
    data: ReviewImageRequest,
    current_user: Annotated[User, Depends(require_supervisor_or_admin)],
    db: Annotated[Session, Depends(get_db)]
):
    return review_image(image_id, data.approved, data.comment, current_user.id, db)


@router.delete("/{image_id}")
async def delete_image_endpoint(
    image_id: int,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)]
):
    from services.image_service import delete_user_image
    return delete_user_image(image_id, current_user.id, db)
