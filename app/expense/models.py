from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base

class ExpenseCategory(Base):
    __tablename__ = "expense_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    
    expenses = relationship("Expense", back_populates="category", cascade="all, delete")

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(Text, nullable=False)
    amount = Column(Float, nullable=False)
    category_id = Column(Integer, ForeignKey("expense_categories.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())

    user = relationship("User", back_populates="expenses")
    category = relationship("ExpenseCategory", back_populates="expenses")