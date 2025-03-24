from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import List, Optional, Dict, Any

class ExpenseNLPRequest(BaseModel):
    """Schema for natural language expense input"""
    description: str

class ExpensePredictionResponse(BaseModel):
    """Schema for ML prediction response"""
    description: str
    predicted_category_id: int
    predicted_category_name: str
    predicted_amount: float

class ExpenseConfirmation(BaseModel):
    """Schema for expense confirmation"""
    description: str
    category_id: int
    amount: float
    confirmed: bool = True

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
    amount: float = Field(..., gt=0)
    category_id: int

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseResponse(ExpenseBase):
    id: int
    user_id: int
    created_at: datetime
    category: ExpenseCategoryResponse

    model_config = ConfigDict(from_attributes=True)

class ExpensePrediction(BaseModel):
    description: str
    predicted_category: str
    predicted_amount: float

class ExpenseAnalytics(BaseModel):
    total_expenses: float
    category_distribution: Dict[str, float]
    monthly_spending: Dict[str, float]

class PaginatedExpenseResponse(BaseModel):
    items: List[ExpenseResponse]
    total: int
    page: int
    limit: int