"""Configuration and environment variables"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB Configuration
MONGO_URL = os.environ['MONGO_URL']
DB_NAME = os.environ['DB_NAME']

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Stripe Configuration
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', '')
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY', '')

# CORS Configuration
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    os.environ.get('FRONTEND_URL', 'http://localhost:3000')
]

# File Upload
UPLOAD_DIR = ROOT_DIR / 'uploads'
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
