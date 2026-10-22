from fastapi import HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from database.models import Album, Image, AlbumStatus, ImageStatus, User, UserRole
from config.config import UPLOAD_DIR
import os


def _get_latest_visible_image(album: Album):
    visible_images = [
        image for image in album.images
        if image.status in (ImageStatus.CLEAN, ImageStatus.APPROVED)
    ]

    if not visible_images:
        return None

    return max(visible_images, key=lambda image: ((image.created_at or image.id), image.id))


def get_public_gallery(db: Session):
    albums = db.query(Album).filter(
        Album.status == AlbumStatus.APPROVED,
        Album.is_public == True
    ).all()
    return [
        {
            "id": album.id,
            "title": album.title,
            "description": album.description,
            "owner": album.owner.username,
            "status": album.status.value,
            "image_count": len([
                image for image in album.images
                if image.status in (ImageStatus.CLEAN, ImageStatus.APPROVED)
            ]),
            "cover_image_filename": (_get_latest_visible_image(album).filename if _get_latest_visible_image(album) else None),
            "latest_image_filename": (_get_latest_visible_image(album).filename if _get_latest_visible_image(album) else None),
            "created_at": album.created_at
        }
        for album in albums
    ]


def get_album_images(album_id: int, db: Session):
    album = db.query(Album).filter(
        Album.id == album_id,
        Album.status == AlbumStatus.APPROVED,
        Album.is_public == True
    ).first()

    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Álbum no encontrado"
        )

    images = db.query(Image).filter(
        Image.album_id == album_id,
        Image.status.in_([ImageStatus.APPROVED, ImageStatus.CLEAN])
    ).order_by(Image.created_at.asc().nullslast(), Image.id.asc()).all()

    return {
        "album": {
            "id": album.id,
            "title": album.title,
            "description": album.description,
            "owner": album.owner.username,
            "status": album.status.value,
            "is_public": album.is_public,
            "cover_image_filename": (_get_latest_visible_image(album).filename if _get_latest_visible_image(album) else None)
        },
        "images": [
            {
                "id": image.id,
                "filename": image.filename,
                "original_filename": image.original_filename,
                "status": image.status.value,
                "uploader_id": image.uploader_id,
                "steganography_detected": image.status == ImageStatus.QUARANTINED
            }
            for image in images
        ]
    }


def _can_view_private_image(user: User | None, album: Album) -> bool:
    if user is None:
        return False
    role = str(getattr(user.role, "value", user.role)).lower()
    return user.id == album.owner_id or role in (UserRole.SUPERVISOR.value, UserRole.ADMIN.value)


def serve_image(filename: str, db: Session, user: User | None = None):
    not_found = HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Imagen no encontrada"
    )

    # Only files registered in the database are served (the filename is not trusted)
    image = db.query(Image).filter(Image.filename == filename).first()
    if not image:
        raise not_found

    album = image.album
    is_public = (
        image.status in (ImageStatus.CLEAN, ImageStatus.APPROVED)
        and album.status == AlbumStatus.APPROVED
        and album.is_public
    )
    # 404 instead of 403 so the existence of private files is not revealed
    if not is_public and not _can_view_private_image(user, album):
        raise not_found

    file_path = os.path.join(UPLOAD_DIR, image.filename)
    if not os.path.exists(file_path):
        raise not_found

    return FileResponse(
        file_path,
        media_type="image/jpeg",
        headers={
            "Cache-Control": "public, max-age=31536000" if is_public else "private, no-store",
            "X-Content-Type-Options": "nosniff"
        }
    )
