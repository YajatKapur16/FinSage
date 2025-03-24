from fastapi import FastAPI, Request, status
from fastapi.openapi.utils import get_openapi
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.auth import routes as auth_routes, schemas as auth_schemas
from app.forum import routes as forum_routes, schemas as forum_schemas
from app.expense import routes as expense_routes, schemas as expense_schemas
from app.database import Base, engine, verify_database
from app.core.config import setup_logging, ALLOWED_ORIGINS
from app.expense.ml_service import expense_ml_service
import logging
from datetime import datetime
from pydantic import BaseModel
from inspect import isclass

# Setup logging first
setup_logging()
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="FinSage API",
    description="Financial Management API with ML-powered expense tracking",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware with proper configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
    ],
    expose_headers=["*"],
    max_age=3600,
)

# Health check endpoint
@app.get("/health", 
         tags=["Health"],
         summary="Check API health",
         response_description="Basic health check response")
async def health_check():
    """
    Perform a health check of the API and its dependencies.
    Returns system health information and basic metrics.
    """
    # Check database connection
    db_status = "healthy" if verify_database() else "unhealthy"
    
    return {
        "status": "ok" if db_status == "healthy" else "degraded",
        "timestamp": datetime.utcnow().isoformat(),
        "database": db_status,
        "version": "1.0.0"
    }

# Global exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle any unhandled exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An unexpected error occurred"}
    )

# Helper function to get Pydantic models from a module
def get_pydantic_models(module):
    """Get all Pydantic model classes from a module"""
    models = {}
    for name, obj in module.__dict__.items():
        if (
            isclass(obj) 
            and issubclass(obj, BaseModel) 
            and obj != BaseModel 
            and not name.startswith('_')
        ):
            models[name] = obj
    return models

# OpenAPI configuration
def custom_openapi():
    """Configure OpenAPI schema with security"""
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="FinSage API",
        version="1.0.0",
        description="Financial Management API with ML-powered expense tracking",
        routes=app.routes,
    )

    # Define components section if it doesn't exist
    if "components" not in openapi_schema:
        openapi_schema["components"] = {}
    
    # Add security schemes
    openapi_schema["components"]["securitySchemes"] = {
        "bearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
            "description": "Enter your JWT token in the format: Bearer <token>"
        }
    }

    # Add schemas section if it doesn't exist
    if "schemas" not in openapi_schema["components"]:
        openapi_schema["components"]["schemas"] = {}

    # Add Pydantic models to components/schemas
    schema_modules = [auth_schemas, forum_schemas, expense_schemas]
    
    for module in schema_modules:
        models = get_pydantic_models(module)
        for model_name, model_class in models.items():
            try:
                schema = model_class.model_json_schema()
                openapi_schema["components"]["schemas"][model_name] = schema
            except Exception as e:
                logger.warning(f"Failed to generate schema for {model_name}: {str(e)}")
                continue

    # Apply security globally to all routes except /auth/login and /auth/register
    for path in openapi_schema["paths"]:
        # Skip authentication endpoints
        if path in ["/auth/login", "/auth/register", "/health"]:
            continue
        
        # Add security requirement to all methods in the path
        for method in openapi_schema["paths"][path]:
            openapi_schema["paths"][path][method]["security"] = [{"bearerAuth": []}]

    app.openapi_schema = openapi_schema
    return app.openapi_schema

# Set custom OpenAPI schema
app.openapi = custom_openapi

# Include routers
app.include_router(auth_routes.router)
app.include_router(forum_routes.router)
app.include_router(expense_routes.router)

# Application lifecycle events
@app.on_event("startup")
async def startup_event():
    """Handle application startup"""
    try:
        # Verify database connection
        logger.info("Verifying database connection...")
        if not verify_database():
            raise Exception("Database verification failed")
        
        # Create database tables
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        
        # Initialize expense categories
        logger.info("Initializing expense categories...")
        from app.database import SessionLocal
        from app.expense.routes import init_default_categories
        
        db = SessionLocal()
        try:
            init_default_categories(db)
            logger.info("Expense categories initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing categories: {str(e)}")
            raise
        finally:
            db.close()
            
        # Preload ML model during startup
        logger.info("Loading expense ML model...")
        if expense_ml_service.load_model():
            logger.info("ML model loaded successfully")
        else:
            logger.warning("Failed to load ML model, will try again on first request")
            
        logger.info("Application startup completed successfully")
    except Exception as e:
        logger.error(f"Application startup failed: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Handle graceful shutdown"""
    logger.info("Application shutting down...")
