from fastapi import FastAPI
from datetime import datetime
from contextlib import asynccontextmanager
import uvicorn
from database.database import create_tables
from routers.auth_router import router as auth_router
from routers.album_router import router as album_router
from routers.image_router import router as image_router
from routers.gallery_router import router as gallery_router
from security.middleware import setup_cors_middleware, setup_trusted_host_middleware, setup_security_middleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_tables()
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
app.include_router(album_router, prefix="/api/albums", tags=["álbumes"])
app.include_router(image_router, prefix="/api/images", tags=["imágenes"])
app.include_router(gallery_router, prefix="/api", tags=["galería"])

@app.get("/health")
async def health_check():
    from database.database import test_connection
    
    db_status = "conectada" if test_connection() else "error"
    return {
        "estado": "saludable", 
        "timestamp": datetime.utcnow(),
        "database": db_status
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
