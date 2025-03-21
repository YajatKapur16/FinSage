from fastapi import FastAPI
from app.routers import auth  # Import auth router
from app.database import Base, engine

# Ensure tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Include authentication routes
app.include_router(auth.router)
