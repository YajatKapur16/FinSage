from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.database import Base
from sqlalchemy.orm import relationship
from datetime import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    phone_number = Column(String, unique=True, nullable=True)
    hashed_password = Column(String, nullable=False)
    failed_login_attempts = Column(Integer, default=0)
    is_locked = Column(Boolean, default=False)
    unlock_token = Column(String, nullable=True)
    is_admin = Column(Boolean, default=False)
    last_login = Column(DateTime, nullable=True)

    threads = relationship("Thread", back_populates="user", cascade="all, delete")
    replies = relationship("Reply", back_populates="user", cascade="all, delete")
    expenses = relationship("Expense", back_populates="user", cascade="all, delete")