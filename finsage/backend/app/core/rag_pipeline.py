from typing import List, Dict, Optional
from utils.logging import logger
from core.query_expander import QueryExpander
from core.vector_retriever import VectorRetriever
from core.response_generator import ResponseGenerator
from core.language_model import LLMResponse

class RAGPipeline:
    def __init__(self, query_expander: QueryExpander, vector_retriever: VectorRetriever, 
                 response_generator: ResponseGenerator, relevance_threshold: float = 0.5):
        self.query_expander = query_expander
        self.vector_retriever = vector_retriever
        self.response_generator = response_generator
        self.relevance_threshold = relevance_threshold

    def process(self, user_query: str, conversation_history: Optional[List[Dict[str, str]]] = None) -> LLMResponse:
        logger.info(f"Processing query through RAG pipeline: {user_query}")
        
        try:
            # Expand query
            expanded_queries = self.query_expander.expand_query(user_query)
            logger.info(f"Query expanded into {len(expanded_queries)} queries")
            
            # Retrieve relevant documents with scores
            retrieved_docs_with_scores = self.vector_retriever.vector_store.search_with_scores(user_query, k=10)
            logger.info(f"Retrieved {len(retrieved_docs_with_scores)} documents")
            
            # Filter for relevance using Chroma's similarity scores
            relevant_docs = [doc for doc, score in retrieved_docs_with_scores if score >= self.relevance_threshold]
            logger.info(f"Filtered to {len(relevant_docs)} relevant documents")
            
            # Generate response
            response = self.response_generator.generate(user_query, relevant_docs, conversation_history)
            logger.info("Response generated successfully")
            
            # Add pipeline metadata
            response.metadata["num_expanded_queries"] = len(expanded_queries)
            response.metadata["num_retrieved_docs"] = len(retrieved_docs_with_scores)
            response.metadata["num_relevant_docs"] = len(relevant_docs)
            
            return response
        except Exception as e:
            logger.error(f"Error in RAG pipeline: {str(e)}")
            raise
        
class FinSageAdvisor:
    def __init__(self, rag_pipeline: RAGPipeline):
        self.rag_pipeline = rag_pipeline
        logger.info("FinSageAdvistor initialized")

    def get_advice(self, user_query: str, conversation_history: Optional[List[Dict[str, str]]] = None) -> LLMResponse:
        logger.info(f"Getting advice for user query: {user_query}")
        response = self.rag_pipeline.process(user_query, conversation_history)
        logger.info("Advice generated successfully")
        return response