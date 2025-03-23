from fastapi import FastAPI
from app.auth import routes as auth_routes
from app.forum import routes as forum_routes
from app.database import Base, engine

from fastapi.middleware.cors import CORSMiddleware


# Ensure tables exist
Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = [
    "http://localhost:3000",  # Next.js local dev server
    "http://127.0.0.1:3000",  # Alternative localhost URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow specific origins
    allow_credentials=True,  # Allow credentials (cookies, authorization headers)
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)
# Include authentication routes
app.include_router(auth_routes.router)
app.include_router(forum_routes.router)
