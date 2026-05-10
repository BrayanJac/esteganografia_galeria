import os
import re
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from database.models import Album, AlbumStatus, Image, ImageMetadata, ImageStatus
from config.config import UPLOAD_DIR


HTML_TAG_PATTERN = re.compile(r"<\s*/?\s*[a-zA-Z!][^>]*>")
ALBUM_NOT_FOUND_DETAIL = "Álbum no encontrado"


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


def create_album(title: str, description: str, is_public: bool, owner_id: int, db: Session):
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


def _serialize_album(album: Album):
    return {
        "id": album.id,
        "title": album.title,
        "description": album.description,
        "status": album.status.value,
        "is_public": album.is_public,
        "owner_id": album.owner_id,
        "owner": album.owner.username,
        "reviewer": album.reviewer.username if album.reviewer else None,
        "review_comment": album.review_comment,
        "image_count": len(album.images),
        "created_at": album.created_at.isoformat() if album.created_at else None,
        "updated_at": album.updated_at.isoformat() if album.updated_at else None,
    }


def _append_review_comment(album: Album, reviewer_username: str, review_comment: str | None):
    if not review_comment:
        return

    timestamp = datetime.now(timezone.utc).isoformat()
    entry = f"[{timestamp}] {reviewer_username}: {review_comment.strip()}"
    album.review_comment = f"{album.review_comment}\n{entry}".strip(
    ) if album.review_comment else entry


def get_user_albums(user_id: int, db: Session):
    albums = db.query(Album).filter(Album.owner_id == user_id).all()
    return [
        _serialize_album(album)
        for album in albums
    ]


def get_accessible_albums(user_id: int, db: Session):
    owned_albums = db.query(Album).filter(Album.owner_id == user_id).all()
    public_albums = db.query(Album).filter(
        Album.status == AlbumStatus.APPROVED,
        Album.is_public == True,
        Album.owner_id != user_id
    ).all()

    albums = owned_albums + public_albums

    return [
        _serialize_album(album)
        for album in albums
    ]


def get_album_for_user(album_id: int, user_id: int, db: Session):
    album = db.query(Album).filter(Album.id == album_id).first()

    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ALBUM_NOT_FOUND_DETAIL
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
                "uploader_id": image.uploader_id,
                "steganography_detected": image.status == ImageStatus.QUARANTINED,
            }
            for image in images_query
        ]
    }


def get_pending_albums(db: Session):
    albums = db.query(Album).filter(Album.status == AlbumStatus.PENDING).all()
    return [
        {
            "id": album.id,
            "title": album.title,
            "description": album.description,
            "owner": album.owner.username,
            "created_at": album.created_at.isoformat() if album.created_at else None,
        }
        for album in albums
    ]


def get_admin_albums(db: Session):
    albums = db.query(Album).order_by(Album.created_at.desc()).all()

    return {
        "albums": [
            _serialize_album(album)
            for album in albums
        ]
    }


def update_album(album_id: int, owner_id: int, title: str | None, description: str | None, db: Session):
    album = db.query(Album).filter(Album.id == album_id).first()

    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ALBUM_NOT_FOUND_DETAIL
        )

    if album.owner_id != owner_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para editar este álbum"
        )

    if album.status == AlbumStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes editar un álbum en estado pendiente"
        )

    if title is None and description is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes enviar al menos un campo para actualizar"
        )

    if title is not None:
        album.title = title

    if description is not None:
        _validate_album_description(description)
        album.description = description

    db.commit()
    db.refresh(album)

    return _serialize_album(album)


def update_album_review(
    album_id: int,
    reviewer_id: int,
    reviewer_username: str,
    approved: bool | None,
    review_comment: str | None,
    db: Session,
):
    album = db.query(Album).filter(Album.id == album_id).first()

    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ALBUM_NOT_FOUND_DETAIL
        )

    if album.status == AlbumStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes editar un álbum en estado pendiente"
        )

    if approved is None and review_comment is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes enviar al menos un campo para actualizar"
        )

    if approved is not None:
        album.status = AlbumStatus.APPROVED if approved else AlbumStatus.REJECTED

    _append_review_comment(album, reviewer_username, review_comment)

    album.reviewer_id = reviewer_id

    db.commit()
    db.refresh(album)

    return _serialize_album(album)


def approve_album(album_id: int, approved: bool, comment: str, reviewer_id: int, reviewer_username: str, db: Session):
    album = db.query(Album).filter(Album.id == album_id).first()

    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ALBUM_NOT_FOUND_DETAIL
        )

    album.status = AlbumStatus.APPROVED if approved else AlbumStatus.REJECTED
    album.reviewer_id = reviewer_id
    _append_review_comment(album, reviewer_username, comment)

    db.commit()

    return {"mensaje": f"Álbum {'aprobado' if approved else 'rechazado'} exitosamente"}


def get_reviewed_albums(db: Session):
    albums = db.query(Album).filter(Album.status != AlbumStatus.PENDING).order_by(
        Album.updated_at.desc().nullslast(), Album.created_at.desc()).all()
    return {
        "albums": [
            _serialize_album(album)
            for album in albums
        ]
    }


def delete_album(album_id: int, db: Session):
    album = db.query(Album).filter(Album.id == album_id).first()

    if not album:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ALBUM_NOT_FOUND_DETAIL
        )

    for image in album.images:
        for metadata_record in image.metadata_records:
            db.delete(metadata_record)

        file_path = os.path.join(UPLOAD_DIR, image.filename)
        if os.path.exists(file_path):
            os.remove(file_path)

        db.delete(image)

    db.delete(album)
    db.commit()

    return {"mensaje": f"Álbum {album.title} eliminado exitosamente"}
