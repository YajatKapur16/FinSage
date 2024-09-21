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

def main():
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    logger = logging.getLogger(__name__)

    pdf_input_dir = r"finsage\backend\app\data\input_pdfs"
    vector_db_dir = r"finsage\backend\app\data\vector_database"
    system_state_dir = r"finsage\backend\app\data\system_state"

    logger.info("Initializing FinSageAdvisorSystem")
    advisor_system = FinSageAdvisorSystem(pdf_input_dir, vector_db_dir)

    # logger.info("Saving initial system state")
    # advisor_system.save_system_state(system_state_dir)

    conversation_history: List[Dict[str, str]] = []

    try:
        while True:
            user_query = input("Enter your finance and tax-related question (or 'quit' to exit): ").strip()

            if not user_query:
                print("Please enter a valid question.")
                continue

            if user_query.lower() == 'quit':
                break            

            logger.info("Processing user query")
            response = advisor_system.get_advice(user_query, conversation_history)

            print(f"AI: {response.text}")

            if "I don't have enough information" not in response.text:
                conversation_history.append({"role": "human", "content": user_query})
                conversation_history.append({"role": "ai", "content": response.text})

            if len(conversation_history) % 10 == 0:
                logger.info("Saving conversation history")
                advisor_system.save_conversation(conversation_history, "conversation_history.txt")

            if len(conversation_history) > 20:
                logger.info("Summarizing conversation history")
                summary = advisor_system.summarize_conversation(conversation_history)
                conversation_history = [{"role": "system", "content": "Previous conversation summary: " + summary}]
                
    except KeyboardInterrupt:
        logger.info("User interrupted the session")
    except Exception as e:
        logger.error(f"An error occurred: {str(e)}")
    finally:
        logger.info("Saving final conversation history")
        advisor_system.save_conversation(conversation_history, "final_conversation_history.txt")

        logger.info("Saving final system state")
        advisor_system.save_system_state(system_state_dir)
        logger.info("FinSageAdvisorSystem session ended")

if __name__ == "__main__":
    main()