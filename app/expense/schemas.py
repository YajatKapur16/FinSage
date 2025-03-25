from pydantic import BaseModel, Field, validator, ConfigDict
from datetime import datetime
from typing import Optional, List, Dict

class ExpenseCategoryBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None

class ExpenseCategoryCreate(ExpenseCategoryBase):
    pass

class ExpenseCategoryResponse(ExpenseCategoryBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)

class ExpenseBase(BaseModel):
    description: str
    amount: float = Field(..., gt=0)  # Ensure amount is positive
    category_id: int

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: int
    user_id: int
    created_at: datetime
    category: ExpenseCategoryResponse
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": 1,
                "description": "Groceries at Walmart",
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
        }
    )

class ExpenseNLPRequest(BaseModel):
    description: str = Field(..., description="Natural language description of the expense")

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "description": "Paid $45.99 for groceries at Walmart"
        }
    })

class ExpenseConfirmation(BaseModel):
    description: str
    amount: float = Field(..., gt=0)
    category_id: int
    confirmed: bool = True

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "description": "Paid $45.99 for groceries at Walmart",
            "amount": 45.99,
            "category_id": 2,
            "confirmed": True
        }
    })

class ExpensePrediction(BaseModel):
    description: str
    predicted_category: str
    predicted_amount: float

class ExpensePredictionResponse(BaseModel):
    description: str
    predicted_category_id: int
    predicted_category_name: str
    predicted_amount: float

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "description": "Paid $45.99 for groceries at Walmart",
            "predicted_category_id": 2,
            "predicted_category_name": "Groceries",
            "predicted_amount": 45.99
        }
    })

class ExpenseAnalytics(BaseModel):
    total_expenses: float
    category_distribution: Dict[str, float]
    monthly_spending: Dict[str, float]

    model_config = ConfigDict(json_schema_extra={
        "example": {
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
    })

class PaginatedExpenseResponse(BaseModel):
    items: List[ExpenseResponse]
    total: int
    page: int
    limit: int

    model_config = ConfigDict(json_schema_extra={
        "example": {
            "items": [{
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
            }],
            "total": 1,
            "page": 1,
            "limit": 10
        }
    })