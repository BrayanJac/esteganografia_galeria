from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from dotenv import load_dotenv
from config.config import DATABASE_URL

load_dotenv()

# Database engine (uses DATABASE_URL from config)
engine = create_engine(DATABASE_URL, connect_args={
                       "check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    from .models import Base
    Base.metadata.create_all(bind=engine)


def test_connection():
    """Test database connection"""
    try:
        with engine.connect() as connection:
            from sqlalchemy import text
            connection.execute(text("SELECT 1"))
            print("Conexión a la base de datos exitosa")
            return True
    except Exception as e:
        print(f"Error de conexión a la base de datos: {e}")
        return False
