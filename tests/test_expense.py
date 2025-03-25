import pytest
from fastapi import status
from app.expense.models import ExpenseCategory
from unittest.mock import patch

@pytest.fixture
def test_category(db_session):
    category = ExpenseCategory(
        name="Test Category",
        description="Test category description"
    )
    db_session.add(category)
    db_session.commit()
    db_session.refresh(category)
    return category

@pytest.fixture
def mock_ml_service(monkeypatch):
    # We need to ensure the expense ml service is properly mocked
    def mock_predict_expense(text):
        return "Test Category", 25.0
    
    # Import here to avoid circular imports
    from app.expense.ml_service import expense_ml_service
    monkeypatch.setattr(expense_ml_service, "predict_expense", mock_predict_expense)
    return mock_predict_expense

def test_expense_process_unauthorized(client):
    response = client.post(
        "/expense/process",
        json={"description": "Lunch at restaurant $25"}
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED

def test_expense_process_with_auth(auth_client, test_category, mock_ml_service, db_session):
    # Ensure the category exists in the database
    if not db_session.query(ExpenseCategory).filter(ExpenseCategory.name == "Test Category").first():
        category = ExpenseCategory(name="Test Category", description="Test category description")
        db_session.add(category)
        db_session.commit()
    
    client, token = auth_client
    response = client.post(
        "/expense/process",
        headers={"Authorization": f"Bearer {token}"},
        json={"description": "Lunch at restaurant $25"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "predicted_category_name" in data
    assert "predicted_amount" in data
    assert data["description"] == "Lunch at restaurant $25"
    assert data["predicted_category_name"] == "Test Category"
    assert isinstance(data["predicted_amount"], (int, float))

def test_expense_process_ml_error(auth_client, monkeypatch):
    client, token = auth_client
    
    # Create a function that raises an exception
    def mock_predict_expense_error(text):
        raise Exception("ML service error")
    
    # Import here to avoid circular imports
    from app.expense.ml_service import expense_ml_service
    monkeypatch.setattr(expense_ml_service, "predict_expense", mock_predict_expense_error)
    
    response = client.post(
        "/expense/process",
        headers={"Authorization": f"Bearer {token}"},
        json={"description": "Lunch at restaurant $25"}
    )
    assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR

def test_expense_confirm(auth_client, test_category):
    client, token = auth_client
    response = client.post(
        "/expense/confirm",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "description": "Lunch at restaurant",
            "category_id": test_category.id,
            "amount": 25.00,
            "confirmed": True
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["description"] == "Lunch at restaurant"
    assert data["amount"] == 25.00
    assert data["category"]["id"] == test_category.id

def test_expense_confirm_invalid_category(auth_client):
    client, token = auth_client
    response = client.post(
        "/expense/confirm",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "description": "Test expense",
            "category_id": 99999,
            "amount": 25.00,
            "confirmed": True
        }
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND

def test_expense_confirm_negative_amount(auth_client, test_category):
    client, token = auth_client
    response = client.post(
        "/expense/confirm",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "description": "Test expense",
            "category_id": test_category.id,
            "amount": -25.00,
            "confirmed": True
        }
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

def test_get_expenses(auth_client, test_category):
    client, token = auth_client
    # Create an expense first
    response = client.post(
        "/expense/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "description": "Test expense",
            "amount": 50.00,
            "category_id": test_category.id
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    
    # Then get the expense list
    response = client.get(
        "/expense/",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "items" in data
    assert len(data["items"]) >= 1
    assert data["total"] >= 1

def test_get_expenses_pagination(auth_client, test_category):
    client, token = auth_client
    # Create multiple expenses
    for i in range(15):
        response = client.post(
            "/expense/",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "description": f"Test expense {i}",
                "amount": 50.00,
                "category_id": test_category.id
            }
        )
        assert response.status_code == status.HTTP_201_CREATED
    
    # Get first page
    response = client.get(
        "/expense/?skip=0&limit=10",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data["items"]) == 10
    assert data["total"] >= 15
    
    # Get second page
    response = client.get(
        "/expense/?skip=10&limit=10",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data["items"]) >= 5

def test_get_expenses_date_filter(auth_client, test_category):
    client, token = auth_client
    # Create an expense
    response = client.post(
        "/expense/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "description": "Test expense",
            "amount": 50.00,
            "category_id": test_category.id
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    
    # Get with date filter
    response = client.get(
        "/expense/?start_date=2025-01-01T00:00:00Z&end_date=2025-12-31T23:59:59Z",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "items" in data

def test_get_categories(auth_client):
    client, token = auth_client
    response = client.get(
        "/expense/categories",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == status.HTTP_200_OK
    categories = response.json()
    assert isinstance(categories, list)

def test_create_category_as_admin(auth_admin_client):
    client, token = auth_admin_client
    response = client.post(
        "/expense/categories",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "New Category",
            "description": "New category description"
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "New Category"

def test_create_category_as_user(auth_client):
    client, token = auth_client
    response = client.post(
        "/expense/categories",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "New Category",
            "description": "New category description"
        }
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN