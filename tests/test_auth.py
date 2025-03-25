import pytest
from fastapi import status
from app.auth.models import User
from app.core.security import verify_password, verify_access_token

def test_register_user(client):
    response = client.post(
        "/auth/register",
        json={
            "email": "newuser@example.com",
            "first_name": "New",
            "last_name": "User",
            "password": "Password123!",
            "phone_number": "1234567890"
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert "id" in data
    assert "password" not in data

def test_register_duplicate_email(client, test_user, db_session):
    # Ensure the test user is properly created
    existing_user = db_session.query(User).filter(User.email == test_user.email).first()
    assert existing_user is not None
    
    response = client.post(
        "/auth/register",
        json={
            "email": test_user.email,
            "first_name": "Another",
            "last_name": "User",
            "password": "Password123!",
            "phone_number": "+1234567890"
        }
    )
    assert response.status_code == status.HTTP_409_CONFLICT

def test_login_success(client, test_user):
    response = client.post(
        "/auth/login",
        json={"email": test_user.email, "password": "testpass123"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    token = data["access_token"]
    payload = verify_access_token(token)
    assert payload["sub"] == test_user.email

def test_login_invalid_credentials(client, test_user):
    response = client.post(
        "/auth/login",
        json={"email": test_user.email, "password": "wrongpass"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_account_lockout(client, test_user, db_session):
    # Reset failed login attempts
    user = db_session.query(User).filter(User.email == test_user.email).first()
    user.failed_login_attempts = 0
    user.is_locked = False
    db_session.commit()
    
    # Try incorrect password three times
    for _ in range(3):
        response = client.post(
            "/auth/login",
            json={"email": test_user.email, "password": "wrongpass"}
        )
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
    
    # Check if account is locked
    db_session.refresh(user)
    assert user.is_locked == True
    
    # Try with correct password - should be locked
    response = client.post(
        "/auth/login",
        json={"email": test_user.email, "password": "testpass123"}
    )
    # Backend returns 403 for locked accounts, not 401
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_refresh_token(client, test_user):
    # Login to get tokens
    login_response = client.post(
        "/auth/login",
        json={"email": test_user.email, "password": "testpass123"}
    )
    assert login_response.status_code == status.HTTP_200_OK
    data = login_response.json()
    refresh_token = data["refresh_token"]
    
    # Use refresh token to get new access token
    response = client.post(
        "/auth/refresh",
        headers={"Authorization": f"Bearer {refresh_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data

def test_get_current_user(auth_client, test_user):
    client, token = auth_client
    response = client.get(
        "/auth/users/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == test_user.email
    assert data["first_name"] == test_user.first_name  # Use dynamic value from test_user
    assert data["last_name"] == test_user.last_name  # Ensure last_name is also validated
    assert not data.get("is_admin", False)

def test_admin_only_endpoint(auth_client, auth_admin_client, test_user, test_admin):
    # Get user token
    user_client, user_token = auth_client
    
    # Get admin token
    admin_client, admin_token = auth_admin_client
    
    # User should get forbidden
    response = user_client.get(
        "/auth/users",
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN
    
    # Admin should succeed
    response = admin_client.get(
        "/auth/users",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    users = response.json()
    assert len(users) >= 2