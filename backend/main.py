from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Import the main API router
from app.api.v1.api import api_v1_router

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Renewalytics API",
    description="API for the Renewalytics platform",
    version="1.0.0"
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Define allowed origins for CORS
# Adjust this list based on your development and production frontend URLs
origins = [
    "http://localhost:8080", # Your frontend development server
    "http://localhost:3000", # Common alternative frontend port
    # Add other origins like your deployed frontend URL here
    # e.g., "https://your-deployed-frontend.com",
]

# Add CORS middleware (with specific headers from example)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    expose_headers=["Content-Range", "Range"] # Added expose_headers
)

# Include the v1 API router
# All routes defined in api_v1_router will be prefixed with /api/v1
app.include_router(api_v1_router, prefix="/api/v1")

@app.get("/")
async def read_root():
    logger.info("Root endpoint accessed.")
    return {"message": "Welcome to the Renewalytics API"}

# Optional: Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Entry point for running the app with uvicorn (optional, often run from command line)
if __name__ == "__main__":
    import uvicorn
    logger.info("Starting Uvicorn server directly from main.py")
    uvicorn.run(app, host="0.0.0.0", port=8000)
