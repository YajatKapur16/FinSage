from fastapi import FastAPI
from app.auth import routes as auth_routes
from app.database import Base, engine

# Ensure tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI()

# Include authentication routes
app.include_router(auth_routes.router)
