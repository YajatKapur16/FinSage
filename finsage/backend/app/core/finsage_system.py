import os
import json
from typing import List, Dict, Optional
from tqdm import tqdm
from utils.logging import logger
from core.document_processor import DocumentProcessingPipeline
from core.language_model import LanguageModelFactory
from core.vector_store import ChromaVectorStore
from core.rag_pipeline import FinSageAdvisor
from utils.helpers import save_conversation_history, load_conversation_history, summarize_conversation_history
from utils.helpers import create_rag_pipeline
from core.language_model import LLMResponse
from langchain_community.vectorstores import Chroma

class FinSageAdvisorSystem:
    def __init__(self, pdf_input_dir: str, vector_db_dir: str):
        logger.info("Initializing FinSageAdvisorSystem")
        
        # Initialize PDF processing pipeline
        self.pdf_pipeline = DocumentProcessingPipeline(pdf_input_dir, r"finsage\backend\app\data\processed_pdfs")
        
        # # Process PDFs and get processed files
        # processed_files = self.pdf_pipeline.run()
        
        # # Load documents
        # documents = self.load_documents(r"finsage\backend\app\data\processed_pdfs")
        
        # # Initialize vector store
        # self.vector_store = ChromaVectorStore()
        # self.vector_store.add_documents(documents)
        
        # # Save vector store
        # self.vector_store.save()
        
        self.vector_store = ChromaVectorStore.load(vector_db_dir)

        # Initialize language model
        self.language_model = LanguageModelFactory.create_model()
        
        # Create RAG pipeline
        self.rag_pipeline = create_rag_pipeline(self.language_model, self.vector_store)
        
        # Initialize FinSageAdvisor
        self.FinSage_advisor = FinSageAdvisor(self.rag_pipeline)
        
        logger.info("FinSage AdvisorSystem initialization complete")

    def load_documents(self, processed_pdfs_dir: str) -> List[Dict]:
        documents = []
        files = [f for f in os.listdir(processed_pdfs_dir) if f.endswith('.json')]
        for file in tqdm(files, desc="Loading documents"):
            file_path = os.path.join(processed_pdfs_dir, file)
            try:
                with open(file_path, 'r',encoding='utf-8') as f:
                    doc = json.load(f)
                if isinstance(doc, dict) and 'text' in doc:
                    documents.append(doc)
                else:
                    logger.error(f"File {file} does not have the expected structure. Skipping.")
            except (json.JSONDecodeError, IOError) as e:
                logger.error(f"Error processing file {file_path}: {str(e)}")
        logger.info(f"Successfully loaded {len(documents)} documents")
        return documents

    def get_advice(self, user_query: str, conversation_history: Optional[List[Dict[str, str]]] = None) -> LLMResponse:
        response = self.rag_pipeline.process(user_query, conversation_history)
        if not response.metadata.get("num_relevant_docs", 0):
            return LLMResponse(text="I'm sorry, but I don't have enough relevant information to answer that question. Could you please ask a finance related question?", metadata={})
        return response

    def save_conversation(self, conversation_history: List[Dict[str, str]], file_path: str):
        logger.info(f"Saving conversation to {file_path}")
        save_conversation_history(conversation_history, file_path)

    def load_conversation(self, file_path: str) -> List[Dict[str, str]]:
        logger.info(f"Loading conversation from {file_path}")
        return load_conversation_history(file_path)

    def summarize_conversation(self, conversation_history: List[Dict[str, str]], max_length: int = 500) -> str:
        logger.info("Summarizing conversation")
        return summarize_conversation_history(conversation_history, max_length)

    def update_knowledge_base(self, new_pdf_dir: str):
        logger.info(f"Updating knowledge base with new PDFs from {new_pdf_dir}")
        new_processed_files = self.pdf_pipeline.run()
        new_documents = self.load_documents(new_pdf_dir)
        self.vector_store.add_documents(new_documents)
        self.vector_store.save()
        logger.info("Knowledge base updated successfully")

    def save_system_state(self, directory: str):
        logger.info(f"Saving system state to {directory}")
        os.makedirs(directory, exist_ok=True)
        vector_db_dir = os.path.join(directory, "vector_db")
        self.vector_store.persist_directory = vector_db_dir
        self.vector_store.save()
        logger.info("System state saved successfully")

    def load_system_state(self, directory: str):
        logger.info(f"Loading system state from {directory}")
        vector_db_dir = os.path.join(directory, "vector_db")
        self.vector_store = ChromaVectorStore.load(vector_db_dir)
        self.rag_pipeline = create_rag_pipeline(self.language_model, self.vector_store)
        self.FinSage_advisor = FinSageAdvisor(self.rag_pipeline)
        logger.info("System state loaded successfully")
        
    def save_vector_store(vector_store: ChromaVectorStore, directory: str):
        logger.info(f"Saving vector store to {directory}")
        os.makedirs(directory, exist_ok=True)
        vector_store.persist_directory = directory
        vector_store.save()
        logger.info("Vector store saved successfully")

    def load_vector_store(directory: str) -> ChromaVectorStore:
        logger.info(f"Loading vector store from {directory}")
        vector_store = ChromaVectorStore(persist_directory=directory)
        vector_store.vectorstore = Chroma(persist_directory=directory, embedding_function=vector_store.embedding_model)
        logger.info("Vector store loaded successfully")
        return vector_store