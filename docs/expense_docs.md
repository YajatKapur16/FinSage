# Expense Tracking API Documentation

This document outlines the API endpoints available for expense tracking in FinSage application.

## Authentication Requirements

All expense endpoints require authentication using JWT tokens. Include the token in the Authorization header:
`Authorization: Bearer <TOKEN>`

## ML-Based Expense Prediction

### Predict Expense Category and Amount
- URL: `/expense/predict`
- Method: `POST`
- Description: Analyzes an expense description using ML to predict its category and amount.
- Auth Required: Yes

#### Example Request
```json
POST /expense/predict
Content-Type: application/json
Authorization: Bearer <TOKEN>

{
  "description": "Paid $45.99 for groceries at Walmart",
  "predicted_category": "",
  "predicted_amount": 0
}
```

#### Example Response
```json
{
  "description": "Paid $45.99 for groceries at Walmart",
  "category_id": 2,
  "category_name": "Groceries",
  "amount": 45.99
}
```

#### Possible Responses
- 401: Authentication required
- 500: Internal server error

### Confirm and Save Expense
- URL: `/expense/confirm`
- Method: `POST`
- Description: Confirms a predicted expense and saves it to the database
- Auth Required: Yes

#### Example Request
```json
POST /expense/confirm
Content-Type: application/json
Authorization: Bearer <TOKEN>

{
  "description": "Paid $45.99 for groceries at Walmart",
  "category_id": 2,
  "amount": 45.99,
  "confirmed": true
}
```

#### Example Response
```json
{
  "id": 1,
  "description": "Paid $45.99 for groceries at Walmart",
  "amount": 45.99,
  "category_id": 2,
  "user_id": 5,
  "created_at": "2025-03-23T17:30:00",
  "category": {
    "id": 2,
    "name": "Groceries",
    "description": "Food and supplies from supermarkets"
  }
}
```

#### Possible Responses
- 400: Expense not confirmed
- 401: Authentication required
- 404: Category not found
- 500: Internal server error

## Expense Management

### Create Expense
- URL: `/expense/`
- Method: `POST`
- Description: Creates a new expense record
- Auth Required: Yes

#### Example Request
```json
POST /expense/
Content-Type: application/json
Authorization: Bearer <TOKEN>

{
  "description": "Monthly rent payment",
  "amount": 1200,
  "category_id": 5
}
```

#### Example Response
```json
{
  "id": 2,
  "description": "Monthly rent payment",
  "amount": 1200,
  "category_id": 5,
  "user_id": 5,
  "created_at": "2025-03-23T17:35:00",
  "category": {
    "id": 5,
    "name": "Housing",
    "description": "Rent, mortgage, maintenance"
  }
}
```

#### Possible Responses
- 401: Authentication required
- 404: Category not found
- 500: Internal server error

### Get All Expenses
- URL: `/expense/`
- Method: `GET`
- Description: Retrieves a paginated list of user's expenses
- Auth Required: Yes

#### Query Parameters
- `skip`: Number of records to skip (for pagination)
- `limit`: Number of records to return (max 100)
- `category_id`: Filter by category ID
- `start_date`: Filter by start date (ISO format)
- `end_date`: Filter by end date (ISO format)

#### Example Request
```
GET /expense/?limit=10&skip=0&category_id=2
Authorization: Bearer <TOKEN>
```

#### Example Response
```json
{
  "items": [
    {
      "id": 1,
      "description": "Paid $45.99 for groceries at Walmart",
      "amount": 45.99,
      "category_id": 2,
      "user_id": 5,
      "created_at": "2025-03-23T17:30:00",
      "category": {
        "id": 2,
        "name": "Groceries",
        "description": "Food and supplies from supermarkets"
      }
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10
}
```

#### Possible Responses
- 401: Authentication required
- 500: Internal server error

### Get Specific Expense
- URL: `/expense/{expense_id}`
- Method: `GET`
- Description: Retrieves details of a specific expense
- Auth Required: Yes

#### Example Request
```
GET /expense/1
Authorization: Bearer <TOKEN>
```

#### Example Response
```json
{
  "id": 1,
  "description": "Paid $45.99 for groceries at Walmart",
  "amount": 45.99,
  "category_id": 2,
  "user_id": 5,
  "created_at": "2025-03-23T17:30:00",
  "category": {
    "id": 2,
    "name": "Groceries",
    "description": "Food and supplies from supermarkets"
  }
}
```

#### Possible Responses
- 401: Authentication required
- 404: Expense not found
- 500: Internal server error

### Update Expense
- URL: `/expense/{expense_id}`
- Method: `PUT`
- Description: Updates an existing expense
- Auth Required: Yes

#### Example Request
```json
PUT /expense/1
Content-Type: application/json
Authorization: Bearer <TOKEN>

{
  "description": "Groceries at Walmart",
  "amount": 46.99,
  "category_id": 2
}
```

#### Example Response
```json
{
  "id": 1,
  "description": "Groceries at Walmart",
  "amount": 46.99,
  "category_id": 2,
  "user_id": 5,
  "created_at": "2025-03-23T17:30:00",
  "category": {
    "id": 2,
    "name": "Groceries",
    "description": "Food and supplies from supermarkets"
  }
}
```

#### Possible Responses
- 401: Authentication required
- 404: Expense or category not found
- 500: Internal server error

### Delete Expense
- URL: `/expense/{expense_id}`
- Method: `DELETE`
- Description: Deletes an expense
- Auth Required: Yes

#### Example Request
```
DELETE /expense/1
Authorization: Bearer <TOKEN>
```

#### Example Response
```
204 No Content
```

#### Possible Responses
- 401: Authentication required
- 404: Expense not found
- 500: Internal server error

## Expense Categories

### Get All Categories
- URL: `/expense/categories`
- Method: `GET`
- Description: Retrieves all available expense categories
- Auth Required: Yes

#### Example Request
```
GET /expense/categories
Authorization: Bearer <TOKEN>
```

#### Example Response
```json
[
  {
    "id": 1,
    "name": "Food",
    "description": "Restaurants, takeout, and dining expenses"
  },
  {
    "id": 2,
    "name": "Groceries",
    "description": "Food and supplies from supermarkets"
  }
]
```

### Create Category (Admin only)
- URL: `/expense/categories`
- Method: `POST`
- Description: Creates a new expense category
- Auth Required: Yes (Admin)

#### Example Request
```json
POST /expense/categories
Content-Type: application/json
Authorization: Bearer <ADMIN_TOKEN>

{
  "name": "Car Maintenance",
  "description": "Vehicle repair and maintenance costs"
}
```

#### Example Response
```json
{
  "id": 14,
  "name": "Car Maintenance",
  "description": "Vehicle repair and maintenance costs"
}
```

## Expense Analytics

### Get Expense Summary
- URL: `/expense/analytics/summary`
- Method: `GET`
- Description: Retrieves expense analytics for visualization
- Auth Required: Yes

#### Query Parameters
- `start_date`: Filter by start date (ISO format)
- `end_date`: Filter by end date (ISO format)

#### Example Request
```
GET /expense/analytics/summary
Authorization: Bearer <TOKEN>
```

#### Example Response
```json
{
  "total_expenses": 1246.99,
  "category_distribution": {
    "Groceries": 45.99,
    "Housing": 1200.00,
    "Entertainment": 1.00
  },
  "monthly_spending": {
    "2025-03": 1246.99
  }
}
```

#### Possible Responses
- 401: Authentication required
- 500: Internal server error