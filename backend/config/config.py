import os
from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/secure_gallery")

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# Password Security
PASSWORD_MIN_LENGTH = int(os.getenv("PASSWORD_MIN_LENGTH", "12"))
PASSWORD_REQUIRE_UPPERCASE = os.getenv("PASSWORD_REQUIRE_UPPERCASE", "true").lower() == "true"
PASSWORD_REQUIRE_LOWERCASE = os.getenv("PASSWORD_REQUIRE_LOWERCASE", "true").lower() == "true"
PASSWORD_REQUIRE_NUMBERS = os.getenv("PASSWORD_REQUIRE_NUMBERS", "true").lower() == "true"
PASSWORD_REQUIRE_SPECIAL = os.getenv("PASSWORD_REQUIRE_SPECIAL", "true").lower() == "true"

# Rate Limiting
LOGIN_ATTEMPTS_LIMIT = int(os.getenv("LOGIN_ATTEMPTS_LIMIT", "5"))
LOGIN_ATTEMPTS_WINDOW_MINUTES = int(os.getenv("LOGIN_ATTEMPTS_WINDOW_MINUTES", "15"))
UPLOAD_RATE_LIMIT = int(os.getenv("UPLOAD_RATE_LIMIT", "10"))

# File Upload
MAX_FILE_SIZE = int(os.getenv("MAX_FILE_SIZE", "10485760"))
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")

# Steganography Detection
STEGANOGRAPHY_THRESHOLD = float(os.getenv("STEGANOGRAPHY_THRESHOLD", "0.7"))
ENABLE_LSB_ANALYSIS = os.getenv("ENABLE_LSB_ANALYSIS", "true").lower() == "true"
ENABLE_HISTOGRAM_ANALYSIS = os.getenv("ENABLE_HISTOGRAM_ANALYSIS", "true").lower() == "true"
ENABLE_EOF_ANALYSIS = os.getenv("ENABLE_EOF_ANALYSIS", "true").lower() == "true"

# CORS
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", '["http://localhost:3000", "http://localhost:8080"]')
if isinstance(ALLOWED_ORIGINS, str):
    import json
    ALLOWED_ORIGINS = json.loads(ALLOWED_ORIGINS)
