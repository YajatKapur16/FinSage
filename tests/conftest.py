import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.database import Base, get_db
from app.main import app
from app.auth.models import User
from app.auth.middleware import get_current_user
from app.core.security import hash_password, create_access_token

# Use in-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Create a function to override get_current_user
async def override_get_current_user_with_user(db_session, test_user):
    async def _get_current_user():
        return test_user
    return _get_current_user

async def override_get_current_admin_with_admin(db_session, test_admin):
    async def _get_current_admin():
        return test_admin
    return _get_current_admin

@pytest.fixture(scope="function")
def db_session():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Use a session
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
    
    # Drop tables after test
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db_session):
    # Override the get_db dependency
    app.dependency_overrides[get_db] = override_get_db
    
    # Create test client
    with TestClient(app) as test_client:
        yield test_client
    
    # Clean up
    app.dependency_overrides.clear()

@pytest.fixture
def test_user(db_session):
    # Create a test user
    user = User(
        email="test@example.com",
        first_name="Test",
        last_name="User",
        phone_number="1234567890",
        hashed_password=hash_password("testpass123"),
        failed_login_attempts=0,
        is_locked=False,
        is_admin=False
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def auth_client(client, test_user):
    # Generate token with much longer validity for tests
    token = create_access_token({"sub": test_user.email}, expires_delta=None)
    return client, token

@pytest.fixture
def auth_admin_client(client, test_admin):
    # Generate admin token with admin claims
    token = create_access_token({
        "sub": test_admin.email,
        "is_admin": True  # Add admin claim to token
    })
    return client, token

@pytest.fixture
def test_admin(db_session):
    # Create an admin user with explicit admin flag
    admin = User(
        email="admin@example.com",
        first_name="Admin",
        last_name="User",
        phone_number="0987654321",
        hashed_password=hash_password("adminpass123"),
        failed_login_attempts=0,
        is_locked=False,
        is_admin=True
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin