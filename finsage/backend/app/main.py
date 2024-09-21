import os
import logging
from typing import List, Dict
import asyncio
import nest_asyncio
from pyngrok import ngrok
import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from contextlib import asynccontextmanager

from core.finsage_system import FinSageAdvisorSystem
from utils.logging import logger

pdf_input_dir = r"finsage\backend\app\data\input_pdfs"
vector_db_dir = r"finsage\backend\app\data\vector_database"
system_state_dir = r"finsage\backend\app\data\system_state"

class FinSageAdvisorState:
    def __init__(self):
        self.advisor_system = None
        self.conversation_history: List[Dict[str, str]] = []

state = FinSageAdvisorState()

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Initializing FinSageAdvisorSystem")
    state.advisor_system = FinSageAdvisorSystem(pdf_input_dir, vector_db_dir)
    logger.info("FinSageAdvisorSystem initialized")
    logger.info(f"Vector store contains {len(state.advisor_system.vector_store.vectorstore.get())} documents")
    
    yield
    
    logger.info("Saving final conversation history")
    if state.advisor_system:
        state.advisor_system.save_conversation(state.conversation_history, "final_conversation_history.txt")
        logger.info("Saving final system state")
    logger.info("FinSageAdvisorSystem session ended")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Query(BaseModel):
    text: str

def get_advisor_system():
    if state.advisor_system is None:
        raise RuntimeError("FinSageAdvisorSystem not initialized")
    return state.advisor_system

@app.post("/query")
async def query_model(query: Query, advisor_system: FinSageAdvisorSystem = Depends(get_advisor_system)):
    try:
        user_query = query.text
        logger.info(f"Received query: {user_query}")

        response = await asyncio.to_thread(advisor_system.get_advice, user_query, state.conversation_history)

        state.conversation_history.append({"role": "human", "content": user_query})
        state.conversation_history.append({"role": "ai", "content": response.text})

        if len(state.conversation_history) > 20:
            logger.info("Summarizing conversation history")
            summary = advisor_system.summarize_conversation(state.conversation_history)
            state.conversation_history = [{"role": "system", "content": "Previous conversation summary: " + summary}]

        if len(state.conversation_history) % 10 == 0:
            logger.info("Saving conversation history")
            advisor_system.save_conversation(state.conversation_history, "conversation_history.txt")

        return {"response": response.text}
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}", exc_info=True)
        return {"error": str(e)}

def run_app():
    port = 8000
    ngrok_tunnel = ngrok.connect(port)
    print("Public URL:", ngrok_tunnel.public_url)

    nest_asyncio.apply()
    uvicorn.run(app, host="0.0.0.0", port=port)

if __name__ == "__main__":
    run_app()