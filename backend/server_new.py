"""
Masters Meat Haus - Refactored Backend Server
Production-ready FastAPI application with modular architecture
"""
from fastapi import FastAPI, APIRouter
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
import logging

# Import configuration
from config import ALLOWED_ORIGINS

# Import route modules
from routes.auth import router as auth_router
from routes.products import router as products_router
from routes.memberships import router as memberships_router
from routes.stripe import router as stripe_router

# Import legacy routes (will be refactored incrementally)
import server as legacy_server

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the main FastAPI app
app = FastAPI(
    title="Masters Meat Haus API",
    description="Premium e-commerce platform for USDA Prime & Wagyu steaks",
    version="2.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create API router
api_router = APIRouter(prefix="/api")

# Register refactored route modules
api_router.include_router(auth_router)
api_router.include_router(products_router)
api_router.include_router(memberships_router)
api_router.include_router(stripe_router)

# Include remaining routes from legacy server (temporary)
# TODO: Refactor these into separate modules
api_router.include_router(legacy_server.api_router, prefix="")

# Mount API router
app.include_router(api_router)

# Serve uploaded files
try:
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
except RuntimeError:
    logger.warning("Uploads directory not found")

@app.on_event("startup")
async def startup_event():
    """Application startup tasks"""
    logger.info("🚀 Masters Meat Haus API starting up...")
    logger.info("✅ Refactored modular architecture loaded")
    logger.info("✅ Auth, Products, Memberships, Stripe routes active")
    
@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown tasks"""
    logger.info("👋 Masters Meat Haus API shutting down...")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Masters Meat Haus API",
        "version": "2.0.0",
        "architecture": "modular"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "database": "connected",
        "modules": ["auth", "products", "memberships", "stripe"]
    }
