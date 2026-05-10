import os
import re

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from database.models import Album, AlbumStatus, Image, ImageMetadata, ImageStatus
from config.config import UPLOAD_DIR


HTML_TAG_PATTERN = re.compile(r"<\s*/?\s*[a-zA-Z!][^>]*>")


def _validate_album_description(description: str | None):
    if description is None:
        return

    if HTML_TAG_PATTERN.search(description):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La descripción no puede contener HTML o JavaScript"
        )

    if "javascript:" in description.lower():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La descripción no puede contener JavaScript"
        )


async def create_album(title: str, description: str, is_public: bool, owner_id: int, db: Session):
    _validate_album_description(description)

    if description and len(description) > 2000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La descripción es demasiado larga"
        )

    album = Album(
        title=title,
        description=description,
        is_public=is_public,
        owner_id=owner_id,
        status=AlbumStatus.PENDING
    )

    db.add(album)
    db.commit()
    db.refresh(album)

    return {
        "id": album.id,
        "title": album.title,
        "description": album.description,
        "status": album.status.value,
        "created_at": album.created_at
    }


async def get_user_albums(user_id: int, db: Session):
    albums = db.query(Album).filter(Album.owner_id == user_id).all()
    return [
        {
            "id": album.id,
            "title": album.title,
            "description": album.description,
            "status": album.status.value,
            "is_public": album.is_public,
            "owner_id": album.owner_id,
            "owner": album.owner.username,
            "image_count": len(album.images),
            "created_at": album.created_at
        }
        for album in albums
    ]


async def get_accessible_albums(user_id: int, db: Session):
    owned_albums = db.query(Album).filter(Album.owner_id == user_id).all()
    public_albums = db.query(Album).filter(
        Album.status == AlbumStatus.APPROVED,
        Album.is_public == True,
        Album.owner_id != user_id
    ).all()

    albums = owned_albums + public_albums

    return [
        {
            "id": album.id,
            "title": album.title,
            "description": album.description,
            "status": album.status.value,
            "is_public": album.is_public,
            "owner_id": album.owner_id,
            "owner": album.owner.username,
            "image_count": len(album.images),
            "created_at": album.created_at
        }
        for album in albums
    ]


async def get_album_for_user(album_id: int, user_id: int, db: Session):
    album = db.query(Album).filter(Album.id == album_id).first()

    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Álbum no encontrado"
        )

    if album.status != AlbumStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El álbum aún no ha sido aprobado"
        )

    if not album.is_public and album.owner_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver este álbum"
        )

    images_query = album.images
    if album.owner_id != user_id:
        images_query = [
            image for image in images_query if image.status == ImageStatus.APPROVED]

    return {
        "album": {
            "id": album.id,
            "title": album.title,
            "description": album.description,
            "status": album.status.value,
            "is_public": album.is_public,
            "owner_id": album.owner_id,
            "owner": album.owner.username,
            "created_at": album.created_at
        },
        "images": [
            {
                "id": image.id,
                "filename": image.filename,
                "original_filename": image.original_filename,
                "status": image.status.value,
                "steganography_detected": image.status == ImageStatus.QUARANTINED,
            }
            for image in images_query
        ]
    }


async def get_pending_albums(db: Session):
    albums = db.query(Album).filter(Album.status == AlbumStatus.PENDING).all()
    return [
        {
            "id": album.id,
            "title": album.title,
            "description": album.description,
            "owner": album.owner.username,
            "created_at": album.created_at
        }
        for album in albums
    ]


async def get_admin_albums(db: Session):
    albums = db.query(Album).order_by(Album.created_at.desc()).all()

    return {
        "albums": [
            {
                "id": album.id,
                "title": album.title,
                "description": album.description,
                "status": album.status.value,
                "is_public": album.is_public,
                "owner": album.owner.username,
                "reviewer": album.reviewer.username if album.reviewer else None,
                "review_comment": album.review_comment,
                "image_count": len(album.images),
                "created_at": album.created_at.isoformat() if album.created_at else None,
                "updated_at": album.updated_at.isoformat() if album.updated_at else None,
            }
            for album in albums
        ]
    }


async def approve_album(album_id: int, approved: bool, comment: str, reviewer_id: int, db: Session):
    album = db.query(Album).filter(Album.id == album_id).first()

    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Álbum no encontrado"
        )

    album.status = AlbumStatus.APPROVED if approved else AlbumStatus.REJECTED
    album.reviewer_id = reviewer_id
    album.review_comment = comment

    db.commit()

    return {"mensaje": f"Álbum {'aprobado' if approved else 'rechazado'} exitosamente"}


async def delete_album(album_id: int, db: Session):
    album = db.query(Album).filter(Album.id == album_id).first()

    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Álbum no encontrado"
        )

    for image in list(album.images):
        for metadata_record in list(image.metadata_records):
            db.delete(metadata_record)

        file_path = os.path.join(UPLOAD_DIR, image.filename)
        if os.path.exists(file_path):
            os.remove(file_path)

        db.delete(image)

    db.delete(album)
    db.commit()

    return {"mensaje": f"Álbum {album.title} eliminado exitosamente"}
