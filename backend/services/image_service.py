from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session
from database.models import Image, ImageStatus, Album, AlbumStatus
from security.steganography import analyze_image
from config.config import *


async def upload_image(album_id: int, file: UploadFile, user_id: int, db: Session, ip_address: str):
    album = db.query(Album).filter(Album.id == album_id).first()
    if not album or album.owner_id != user_id or album.status != AlbumStatus.APPROVED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Álbum inválido o no aprobado"
        )

    if file.size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Archivo demasiado grande"
        )

    file_data = await process_file(file)

    if file_data['mime_type'] not in ["image/jpeg", "image/png", "image/gif", "image/webp"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de archivo inválido"
        )

    image = create_image_record(
        file_data['filename'],
        file_data['original_filename'],
        file_data['mime_type'],
        file_data['file_size'],
        file_data['file_hash'],
        album_id,
        user_id,
        db
    )

    analysis_results = analyze_image(file_data['file_path'])

    image.steganography_score = analysis_results.get('overall_score', 0.0)
    image.analysis_details = str(analysis_results)

    if analysis_results.get('is_suspicious', False):
        image.status = ImageStatus.QUARANTINED
        image.quarantine_reason = "Detección de esteganografía activada"
    else:
        image.status = ImageStatus.CLEAN

    db.commit()

    return {
        "id": image.id,
        "filename": image.filename,
        "status": image.status.value,
        "steganography_score": image.steganography_score
    }


async def get_quarantined_images(db: Session):
    images = db.query(Image).filter(
        Image.status == ImageStatus.QUARANTINED).all()
    return [
        {
            "id": image.id,
            "filename": image.filename,
            "original_filename": image.original_filename,
            "album": image.album.title,
            "uploader": image.uploader.username,
            "quarantine_reason": image.quarantine_reason,
            "steganography_score": image.steganography_score,
            "created_at": image.created_at
        }
        for image in images
    ]


async def review_image(image_id: int, approved: bool, comment: str, reviewer_id: int, db: Session):
    image = db.query(Image).filter(Image.id == image_id).first()

    if not image or image.status != ImageStatus.QUARANTINED:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Imagen no encontrada o no está en cuarentena"
        )

    if approved:
        image.status = ImageStatus.APPROVED
    else:
        image.status = ImageStatus.REJECTED
        file_path = os.path.join(UPLOAD_DIR, image.filename)
        if os.path.exists(file_path):
            os.remove(file_path)

    image.reviewer_id = reviewer_id
    image.review_comment = comment

    db.commit()

    return {"mensaje": f"Imagen {'aprobada' if approved else 'rechazada'} exitosamente"}


async def process_file(file: UploadFile):
    import aiofiles
    import hashlib
    from datetime import datetime

    content = await file.read()
    # Detect MIME type using simple magic-bytes checks and filename fallback
    import mimetypes

    def _detect_mime(buf: bytes, filename: str) -> str:
        if buf.startswith(b"\xff\xd8\xff"):
            return 'image/jpeg'
        if buf.startswith(b'\x89PNG\r\n\x1a\n'):
            return 'image/png'
        if buf[:6] in (b'GIF87a', b'GIF89a'):
            return 'image/gif'
        if buf.startswith(b'RIFF') and b'WEBP' in buf[8:12]:
            return 'image/webp'
        if buf.startswith(b'BM'):
            return 'image/bmp'
        # fallback to extension
        mim, _ = mimetypes.guess_type(filename)
        return mim or 'application/octet-stream'

    file_mime = _detect_mime(content, file.filename)
    file_hash = hashlib.sha256(content).hexdigest()
    filename = f"{file_hash[:16]}_{datetime.utcnow().timestamp()}.{file_mime.split('/')[-1]}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    async with aiofiles.open(file_path, 'wb') as f:
        await f.write(content)

    return {
        'filename': filename,
        'original_filename': file.filename,
        'mime_type': file_mime,
        'file_size': len(content),
        'file_hash': file_hash,
        'file_path': file_path
    }


def create_image_record(filename: str, original_filename: str, mime_type: str,
                        file_size: int, file_hash: str, album_id: int, user_id: int, db: Session):
    image = Image(
        filename=filename,
        original_filename=original_filename,
        mime_type=mime_type,
        file_size=file_size,
        file_hash=file_hash,
        album_id=album_id,
        uploader_id=user_id,
        status=ImageStatus.PENDING_ANALYSIS
    )

    db.add(image)
    db.commit()
    db.refresh(image)

    return image
