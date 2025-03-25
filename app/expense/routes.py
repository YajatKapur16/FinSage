from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.auth.middleware import get_current_user, get_admin_user
from app.auth.models import User
from app.expense.models import Expense, ExpenseCategory
from app.expense.schemas import (
    ExpenseCreate, ExpenseResponse, ExpenseNLPRequest, 
    ExpensePredictionResponse, ExpenseConfirmation, 
    ExpenseAnalytics, PaginatedExpenseResponse,
    ExpenseCategoryCreate, ExpenseCategoryResponse
)
from app.expense.ml_service import expense_ml_service

router = APIRouter(prefix="/expense", tags=["Expense"])

# Initialize default categories
def init_default_categories(db: Session):
    """Initialize default expense categories if they don't exist."""
    default_categories = [
        {"name": "Food", "description": "Restaurants, takeout, and dining expenses"},
        {"name": "Groceries", "description": "Food and household supplies"},
        {"name": "Parking", "description": "Parking fees and charges"},
        {"name": "Dining", "description": "Restaurant dining and food delivery"},
        {"name": "Entertainment", "description": "Movies, events, and activities"},
        {"name": "Fuel", "description": "Vehicle fuel and gas expenses"},
        {"name": "Shopping", "description": "General retail purchases"},
        {"name": "Rent", "description": "Housing rent or mortgage payments"},
        {"name": "Utilities", "description": "Electricity, water, gas, internet"},
        {"name": "Electronics", "description": "Electronic devices and accessories"},
        {"name": "Clothing", "description": "Clothes, shoes, and accessories"},
        {"name": "Charity", "description": "Charitable donations and giving"},
        {"name": "Transportation", "description": "Public transport and ride services"},
        {"name": "Subscription", "description": "Regular subscription services"},
        {"name": "Healthcare", "description": "Medical expenses and health services"},
        {"name": "Travel", "description": "Travel and accommodation expenses"},
        {"name": "Fitness and Sports", "description": "Gym, sports equipment, activities"},
        {"name": "Home", "description": "Home maintenance and improvements"},
        {"name": "Business", "description": "Business-related expenses"},
        {"name": "Education", "description": "Educational expenses and materials"},
        {"name": "Beauty", "description": "Personal care and beauty products"},
        {"name": "Gifts", "description": "Gifts and presents"},
        {"name": "Insurance", "description": "Insurance premiums and payments"},
        {"name": "Taxes", "description": "Tax payments and related expenses"},
        {"name": "Loan Repayment", "description": "Loan and debt payments"},
        {"name": "Savings", "description": "Money set aside for savings"},
        {"name": "Miscellaneous", "description": "Other uncategorized expenses"},
        {"name": "Pet Care", "description": "Pet supplies and veterinary care"},
        {"name": "Hobbies", "description": "Hobby-related purchases"},
        {"name": "Books", "description": "Books and reading materials"}
    ]
    for cat in default_categories:
        existing = db.query(ExpenseCategory).filter(ExpenseCategory.name == cat["name"]).first()
        if not existing:
            db.add(ExpenseCategory(**cat))
    db.commit()

# Category management routes
@router.get("/categories", response_model=List[ExpenseCategoryResponse])
async def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all available expense categories."""
    categories = db.query(ExpenseCategory).all()
    return categories

@router.post("/categories", response_model=ExpenseCategoryResponse)
def create_category(
    category_data: ExpenseCategoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_admin_user),  # Ensure only admins can create categories
):
    """Create a new expense category (Admin only)"""
    category = ExpenseCategory(
        name=category_data.name,
        description=category_data.description
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category

# Natural language processing endpoint
@router.post("/process", response_model=ExpensePredictionResponse)
async def process_expense(
    expense_input: ExpenseNLPRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Process natural language expense description"""
    try:
        # Get prediction from ML service
        category_name, amount = expense_ml_service.predict_expense(expense_input.description)
        
        # Get or create category
        category = db.query(ExpenseCategory).filter(ExpenseCategory.name == category_name).first()
        if not category:
            category = db.query(ExpenseCategory).filter(ExpenseCategory.name == "Miscellaneous").first()
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Default category 'Miscellaneous' not found"
                )
        
        return {
            "description": expense_input.description,
            "predicted_category_id": category.id,
            "predicted_category_name": category.name,
            "predicted_amount": amount
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing expense: {str(e)}"
        )

@router.post("/confirm", response_model=ExpenseResponse)
async def confirm_expense(
    confirmation: ExpenseConfirmation,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Confirm and save the processed expense"""
    if not confirmation.confirmed:
        raise HTTPException(status_code=400, detail="Expense not confirmed")

    # Verify category exists
    category = db.query(ExpenseCategory).filter(ExpenseCategory.id == confirmation.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # Create and save expense
    expense = Expense(
        description=confirmation.description,
        amount=confirmation.amount,
        category_id=confirmation.category_id,
        user_id=current_user.id
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)

    return {**expense.__dict__, "category": category}

# CRUD routes for expenses
@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new expense."""
    category = db.query(ExpenseCategory).filter(ExpenseCategory.id == expense.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    new_expense = Expense(
        description=expense.description,
        amount=expense.amount,
        category_id=expense.category_id,
        user_id=current_user.id
    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return {**new_expense.__dict__, "category": category}

@router.get("/", response_model=PaginatedExpenseResponse)
def get_expenses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    category_id: Optional[int] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """Retrieve paginated list of expenses."""
    query = db.query(Expense).filter(Expense.user_id == current_user.id)
    if category_id:
        query = query.filter(Expense.category_id == category_id)
    if start_date:
        query = query.filter(Expense.created_at >= start_date)
    if end_date:
        query = query.filter(Expense.created_at <= end_date)
    total = query.count()
    items = query.order_by(Expense.created_at.desc()).offset(skip).limit(limit).all()
    return {
        "items": items,
        "total": total,
        "page": skip // limit + 1,
        "limit": limit
    }

@router.get("/{expense_id}", response_model=ExpenseResponse)
def get_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve a specific expense."""
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    category = db.query(ExpenseCategory).filter(ExpenseCategory.id == expense.category_id).first()
    return {**expense.__dict__, "category": category}

@router.put("/{expense_id}", response_model=ExpenseResponse)
def update_expense(
    expense_id: int,
    expense_update: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an existing expense."""
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    category = db.query(ExpenseCategory).filter(ExpenseCategory.id == expense_update.category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    expense.description = expense_update.description
    expense.amount = expense_update.amount
    expense.category_id = expense_update.category_id
    db.commit()
    db.refresh(expense)
    return {**expense.__dict__, "category": category}

@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an expense."""
    expense = db.query(Expense).filter(Expense.id == expense_id, Expense.user_id == current_user.id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
    return None

# Analytics routes
@router.get("/analytics/summary", response_model=ExpenseAnalytics)
async def get_expense_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None
):
    """Get expense analytics for visualizations"""
    query = db.query(Expense).filter(Expense.user_id == current_user.id)
    
    if start_date:
        query = query.filter(Expense.created_at >= start_date)
    if end_date:
        query = query.filter(Expense.created_at <= end_date)

    # Calculate total expenses
    total_expenses = query.with_entities(func.sum(Expense.amount)).scalar() or 0.0

    # Get category distribution for pie charts
    category_distribution = dict(
        db.query(
            ExpenseCategory.name,
            func.sum(Expense.amount)
        ).join(Expense)
        .filter(Expense.user_id == current_user.id)
        .group_by(ExpenseCategory.name)
        .all()
    )

    # Get monthly spending for line charts
    monthly_spending = dict(
        db.query(
            func.to_char(Expense.created_at, 'YYYY-MM').label('month'),
            func.sum(Expense.amount)
        ).filter(Expense.user_id == current_user.id)
        .group_by('month')
        .all()
    )

    return {
        "total_expenses": float(total_expenses),
        "category_distribution": {k: float(v) for k, v in category_distribution.items()},
        "monthly_spending": {k: float(v) for k, v in monthly_spending.items()}
    }