from typing import List, Dict
from sentence_transformers import SentenceTransformer
from core.language_model import AdvancedLanguageModel
from core.vector_store import ChromaVectorStore
from core.query_expander import QueryExpander
from core.vector_retriever import VectorRetriever
from core.prompt_engine import FinSagePromptEngine
from core.response_generator import ResponseGenerator
from core.rag_pipeline import RAGPipeline
from utils.logging import logger

def load_embedding_model(model_name: str = 'sentence-transformers/multi-qa-mpnet-base-dot-v1') -> SentenceTransformer:
    logger.info(f"Loading embedding model: {model_name}")
    return SentenceTransformer(model_name)

def create_rag_pipeline(language_model: AdvancedLanguageModel, vector_store: ChromaVectorStore) -> RAGPipeline:
    query_expander = QueryExpander(language_model)
    vector_retriever = VectorRetriever(vector_store)
    prompt_engine = FinSagePromptEngine()
    response_generator = ResponseGenerator(language_model, prompt_engine)
    
    return RAGPipeline(query_expander, vector_retriever, response_generator, relevance_threshold=0.5)

def save_conversation_history(history: List[Dict[str, str]], file_path: str):
    """Saves the conversation history to a file."""
    logger.info(f"Saving conversation history to {file_path}")
    with open(file_path, 'w') as f:
        for entry in history:
            f.write(f"{entry['role']}: {entry['content']}\n")

def load_conversation_history(file_path: str) -> List[Dict[str, str]]:
    """Loads the conversation history from a file."""
    logger.info(f"Loading conversation history from {file_path}")
    history = []
    with open(file_path, 'r') as f:
        for line in f:
            role, content = line.split(': ', 1)
            history.append({'role': role.lower(), 'content': content.strip()})
    return history

def summarize_conversation_history(conversation_history: List[Dict[str, str]], max_length: int = 500) -> str:
    """Summarizes the conversation history to fit within a certain length."""
    logger.info("Summarizing conversation history")
    full_text = "\n".join(f"{entry['role'].capitalize()}: {entry['content']}" for entry in conversation_history)
    if len(full_text) <= max_length:
        return full_text
    else:
        summary = full_text[:max_length] + "..."
        return summary