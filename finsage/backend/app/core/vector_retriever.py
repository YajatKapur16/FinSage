from typing import List
from langchain.schema import Document
from core.vector_store import ChromaVectorStore
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

class VectorRetriever:
    def __init__(self, vector_store: ChromaVectorStore):
        self.vector_store = vector_store

    def retrieve(self, query: str, expanded_queries: List[str], top_k: int = 5) -> List[Document]:
        all_queries = [query] + expanded_queries
        all_retrieved_docs = []
        
        for q in all_queries:
            docs = self.vector_store.search(q, k=top_k)
            all_retrieved_docs.extend(docs)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_docs = []
        for doc in all_retrieved_docs:
            if doc.page_content not in seen:
                seen.add(doc.page_content)
                unique_docs.append(doc)
        
        return unique_docs[:top_k]
    

class RelevanceFilter:
    def __init__(self, threshold: float = 0.2):
        self.threshold = threshold
        self.vectorizer = TfidfVectorizer()

    def filter(self, query: str, documents: List[Document]) -> List[Document]:
        if not documents:
            return []

        texts = [query] + [doc.page_content for doc in documents]
        tfidf_matrix = self.vectorizer.fit_transform(texts)
        
        query_vector = tfidf_matrix[0]
        doc_vectors = tfidf_matrix[1:]
        
        similarities = cosine_similarity(query_vector, doc_vectors)[0]
        
        filtered_docs = [doc for doc, sim in zip(documents, similarities) if sim >= self.threshold]
        
        return sorted(filtered_docs, key=lambda x: similarities[documents.index(x)], reverse=True)