from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth.middleware import get_current_user
from app.forum.models import Thread, Reply
from app.forum.schemas import ThreadCreate, ThreadResponse, ReplyCreate, ReplyResponse, ThreadDetailResponse
from typing import List

router = APIRouter(prefix="/forum", tags=["Forum"])

# Create a new thread
@router.post("/threads", response_model=ThreadResponse, status_code=201)
def create_thread(
    thread_data: ThreadCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not thread_data.title.strip():
        raise HTTPException(status_code=422, detail="Title cannot be empty")
        
    if len(thread_data.title) > 100:
        raise HTTPException(status_code=422, detail="Title too long")

    thread = Thread(title=thread_data.title, description=thread_data.description, user_id=current_user.id)
    db.add(thread)
    db.commit()
    db.refresh(thread)
    return thread

# Get threads with pagination.
@router.get("/threads", response_model=List[ThreadResponse])
def get_threads(
    db: Session = Depends(get_db),
    limit: int = Query(10, ge=1, le=100),  # Limit results (default 10, max 100)
    offset: int = Query(0, ge=0)  # Offset for pagination
):
    threads = db.query(Thread).order_by(Thread.created_at.desc()).offset(offset).limit(limit).all()
    return threads

# Get a specific thread with replies
@router.get("/threads/{thread_id}", response_model=ThreadDetailResponse)
def get_thread(thread_id: int, db: Session = Depends(get_db)):
    thread = db.query(Thread).filter(Thread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")

    replies = db.query(Reply).filter(Reply.thread_id == thread_id).all()
    return ThreadDetailResponse(**thread.__dict__, replies=replies)

# Create a reply to a thread
@router.post("/threads/{thread_id}/replies", response_model=ReplyResponse, status_code=201)
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

@router.get("/latest-threads")
def get_latest_threads(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)):
    latest_threads = (
        db.query(Thread)
        .order_by(Thread.created_at.desc())
        .limit(10)
        .all()
    )
    return latest_threads

@router.delete("/threads/{thread_id}")
def delete_thread(
    thread_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    thread = db.query(Thread).filter(Thread.id == thread_id).first()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
        
    # Check if user is owner or admin
    if thread.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own threads"
        )

    db.delete(thread)
    db.commit()
    return {"message": "Thread deleted successfully"}

@router.delete("/replies/{reply_id}")
def delete_reply(
    reply_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    reply = db.query(Reply).filter(Reply.id == reply_id).first()
    if not reply:
        raise HTTPException(status_code=404, detail="Reply not found")

    # Check if user is owner or admin
    if reply.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="You can only delete your own replies"
        )

    db.delete(reply)
    db.commit()
    return {"message": "Reply deleted successfully"}