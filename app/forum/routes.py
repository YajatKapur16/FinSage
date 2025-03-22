from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.middleware import get_current_user
from app.forum.models import Thread, Reply
from app.forum.schemas import ThreadCreate, ThreadResponse, ReplyCreate, ReplyResponse, ThreadDetailResponse
from typing import List

router = APIRouter(prefix="/forum", tags=["Forum"])

# Create a new thread
@router.post("/threads", response_model=ThreadResponse)
def create_thread(
    thread_data: ThreadCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    thread = Thread(title=thread_data.title, description=thread_data.description, user_id=current_user.id)
    db.add(thread)
    db.commit()
    db.refresh(thread)
    return thread

# Get all threads
@router.get("/threads", response_model=List[ThreadResponse])
def get_threads(db: Session = Depends(get_db)):
    return db.query(Thread).all()

# Get a specific thread with replies
@router.get("/threads/{thread_id}", response_model=ThreadDetailResponse)
def get_thread(thread_id: int, db: Session = Depends(get_db)):
    thread = db.query(Thread).filter(Thread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    replies = db.query(Reply).filter(Reply.thread_id == thread_id).all()
    return ThreadDetailResponse(**thread.__dict__, replies=replies)

# Create a reply to a thread
@router.post("/threads/{thread_id}/replies", response_model=ReplyResponse)
def create_reply(
    thread_id: int,
    reply_data: ReplyCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    thread = db.query(Thread).filter(Thread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    reply = Reply(content=reply_data.content, user_id=current_user.id, thread_id=thread_id)
    db.add(reply)
    db.commit()
    db.refresh(reply)
    return reply
