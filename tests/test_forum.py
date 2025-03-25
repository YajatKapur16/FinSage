import pytest
from fastapi import status
from app.forum.models import Thread, Reply

@pytest.fixture
def test_thread(client, test_user, db_session):
    thread = Thread(
        title="Test Thread",
        description="Test thread description",
        user_id=test_user.id
    )
    db_session.add(thread)
    db_session.commit()
    db_session.refresh(thread)
    return thread

def test_create_thread_unauthorized(client):
    response = client.post(
        "/forum/threads",
        json={
            "title": "New Thread",
            "description": "Thread description"
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_create_thread(auth_client, test_user):
    client, token = auth_client
    response = client.post(
        "/forum/threads",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "New Thread",
            "description": "Thread description"
        }
    )
    # Backend was updated to return 201 Created for thread creation
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "New Thread"
    assert data["description"] == "Thread description"
    assert data["user_id"] == test_user.id

def test_get_threads(client, test_thread):
    response = client.get("/forum/threads")
    assert response.status_code == status.HTTP_200_OK
    threads = response.json()
    assert isinstance(threads, list)
    assert len(threads) >= 1
    assert threads[0]["id"] == test_thread.id

def test_get_thread_details(client, test_thread):
    response = client.get(f"/forum/threads/{test_thread.id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == test_thread.id
    assert "replies" in data
    assert isinstance(data["replies"], list)

def test_create_reply(auth_client, test_user, test_thread):
    client, token = auth_client
    response = client.post(
        f"/forum/threads/{test_thread.id}/replies",
        headers={"Authorization": f"Bearer {token}"},
        json={"content": "Test reply content"}
    )
    # Backend was updated to return 201 Created for reply creation
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["content"] == "Test reply content"
    assert data["user_id"] == test_user.id
    assert data["thread_id"] == test_thread.id

def test_delete_own_thread(auth_client, test_thread):
    client, token = auth_client
    response = client.delete(
        f"/forum/threads/{test_thread.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    # The user should be able to delete their own thread
    assert response.status_code == status.HTTP_200_OK

def test_delete_others_thread(client, test_user, test_admin, db_session):
    # Create thread for admin
    other_thread = Thread(
        title="Other Thread",
        description="Other thread description",
        user_id=test_admin.id
    )
    db_session.add(other_thread)
    db_session.commit()
    db_session.refresh(other_thread)
    
    # Login as regular user
    response = client.post(
        "/auth/login",
        json={"email": test_user.email, "password": "testpass123"}
    )
    token = response.json()["access_token"]
    
    # Try to delete admin's thread - should be forbidden
    response = client.delete(
        f"/forum/threads/{other_thread.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_admin_delete_any_thread(auth_admin_client, test_thread):
    client, token = auth_admin_client
    # Admin should be able to delete any thread
    response = client.delete(
        f"/forum/threads/{test_thread.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK

def test_get_latest_threads(auth_client, test_user, db_session):
    client, token = auth_client
    # Create threads with different timestamps
    threads = []
    for i in range(12):  # Create more than 10 to test limit
        thread = Thread(
            title=f"Test Thread {i}",
            description=f"Test thread description {i}",
            user_id=test_user.id
        )
        db_session.add(thread)
        threads.append(thread)
    db_session.commit()

    response = client.get(
        "/forum/latest-threads",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    latest_threads = response.json()
    assert isinstance(latest_threads, list)
    assert len(latest_threads) == 10  # Should only return 10 latest threads

def test_get_threads_pagination(client, test_user, db_session):
    for i in range(15):
        thread = Thread(
            title=f"Test Thread {i}",
            description=f"Test thread description {i}",
            user_id=test_user.id
        )
        db_session.add(thread)
    db_session.commit()
    
    response = client.get("/forum/threads?offset=0&limit=10")
    assert response.status_code == status.HTTP_200_OK
    threads = response.json()
    assert isinstance(threads, list)
    assert len(threads) == 10
    
    response = client.get("/forum/threads?offset=10&limit=10")
    assert response.status_code == status.HTTP_200_OK
    threads = response.json()
    assert isinstance(threads, list)
    assert len(threads) >= 5

def test_create_thread_invalid_title(auth_client):
    client, token = auth_client
    response = client.post(
        "/forum/threads",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "",
            "description": "Thread description"
        }
    )
    # Should fail validation for empty title
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_create_thread_title_too_long(auth_client):
    client, token = auth_client
    response = client.post(
        "/forum/threads",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "title": "T" * 101,  # 101 characters, exceeding 100 char limit
            "description": "Thread description"
        }
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_get_nonexistent_thread(client):
    response = client.get("/forum/threads/99999")
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_create_reply_to_nonexistent_thread(auth_client):
    client, token = auth_client
    response = client.post(
        "/forum/threads/99999/replies",
        headers={"Authorization": f"Bearer {token}"},
        json={"content": "Test reply content"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_create_empty_reply(auth_client, test_thread):
    client, token = auth_client
    response = client.post(
        f"/forum/threads/{test_thread.id}/replies",
        headers={"Authorization": f"Bearer {token}"},
        json={"content": ""}
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_create_reply_content_too_long(auth_client, test_thread):
    client, token = auth_client
    response = client.post(
        f"/forum/threads/{test_thread.id}/replies",
        headers={"Authorization": f"Bearer {token}"},
        json={"content": "T" * 1001}  # Over 1000 characters
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_delete_own_reply(auth_client, test_user, test_thread, db_session):
    client, token = auth_client
    
    # First, create a reply
    reply_response = client.post(
        f"/forum/threads/{test_thread.id}/replies",
        headers={"Authorization": f"Bearer {token}"},
        json={"content": "Test reply content"}
    )
    reply_id = reply_response.json()["id"]
    
    # Try to delete it
    response = client.delete(
        f"/forum/replies/{reply_id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK

def test_delete_others_reply(auth_client, test_user, test_admin, test_thread, db_session):
    # Create a reply as admin
    other_reply = Reply(
        content="Other reply content",
        user_id=test_admin.id,
        thread_id=test_thread.id
    )
    db_session.add(other_reply)
    db_session.commit()
    db_session.refresh(other_reply)

    # Try to delete as regular user - should be forbidden
    client, token = auth_client
    response = client.delete(
        f"/forum/replies/{other_reply.id}",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN

def test_delete_nonexistent_reply(auth_client):
    client, token = auth_client
    response = client.delete(
        "/forum/replies/99999",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND
