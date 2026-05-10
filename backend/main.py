from fastapi import FastAPI
from datetime import datetime
from contextlib import asynccontextmanager
import uvicorn
from database.database import create_tables
from routers.auth_router import router as auth_router

try:
    from routers.album_router import router as album_router
except Exception as e:
    album_router = None
    print(f"Advertencia: no se pudo cargar router de álbumes: {e}")

try:
    from routers.image_router import router as image_router
except Exception as e:
    image_router = None
    print(f"Advertencia: no se pudo cargar router de imágenes: {e}")

try:
    from routers.gallery_router import router as gallery_router
except Exception as e:
    gallery_router = None
    print(f"Advertencia: no se pudo cargar router de galería: {e}")

try:
    from routers.admin_router import router as admin_router
except Exception as e:
    admin_router = None
    print(f"Advertencia: no se pudo cargar router de estado: {e}")

from security.middleware import setup_cors_middleware, setup_trusted_host_middleware, setup_security_middleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        create_tables()
    except Exception as e:
        print(
            f"Advertencia: no se pudieron crear las tablas en el arranque: {e}")
    yield
    # Shutdown (if needed)

app = FastAPI(
    title="Galería Multimedia Segura",
    description="Una galería segura con detección de esteganografía",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

setup_cors_middleware(app)
setup_trusted_host_middleware(app)
setup_security_middleware(app)

app.include_router(auth_router, prefix="/api/auth", tags=["autenticación"])
if album_router is not None:
    app.include_router(album_router, prefix="/api/albums", tags=["álbumes"])
if image_router is not None:
    app.include_router(image_router, prefix="/api/images", tags=["imágenes"])
if gallery_router is not None:
    app.include_router(gallery_router, prefix="/api", tags=["galería"])
if admin_router is not None:
    app.include_router(admin_router, prefix="/api/admin", tags=["estado"])


@app.get("/health")
async def health_check():
    from database.database import test_connection

    db_status = "conectada" if test_connection() else "error"
    return {
        "estado": "saludable",
        "timestamp": datetime.utcnow(),
        "database": db_status
    }


@app.get('/internal/db_tables')
async def internal_db_tables():
    from database.database import engine
    from sqlalchemy import inspect
    inspector = inspect(engine)
    return {"tables": inspector.get_table_names()}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
