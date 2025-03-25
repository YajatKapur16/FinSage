from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

# Schema for creating a thread
class ThreadCreate(BaseModel):
    title: str = Field(..., max_length=100)
    description: str

# Schema for response when returning thread details
class ThreadResponse(BaseModel):
    id: int
    title: str
    description: str
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Schema for creating a reply
class ReplyCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)

# Schema for response when returning reply details
class ReplyResponse(BaseModel):
    id: int
    content: str
    user_id: int
    thread_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Schema for showing a thread with replies
class ThreadDetailResponse(BaseModel):
    id: int
    title: str
    description: str
    user_id: int
    created_at: datetime
    replies: List[ReplyResponse]

    class Config:
        from_attributes = True
