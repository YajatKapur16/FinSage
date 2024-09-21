import traceback
from typing import List, Dict, Any, Tuple
from tqdm import tqdm
from langchain_community.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from langchain_huggingface import HuggingFaceEmbeddings
from utils.logging import logger

class ChromaVectorStore:
    def __init__(self, persist_directory: str = r"finsage\backend\app\data\vector_database\chroma_db"):
        self.embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/multi-qa-mpnet-base-dot-v1")
        self.persist_directory = persist_directory
        self.vectorstore = None
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        logger.info(f"ChromaVectorStore initialized with persist_directory: {persist_directory}")


    def add_documents(self, documents: List[Dict[str, Any]]):
        logger.info(f"Adding {len(documents)} documents to the vector store")
        if not documents:
            logger.warning("No documents to add.")
            return
        
        split_docs = []
        for doc in tqdm(documents, desc="Splitting documents", unit="doc"):
            chunks = self.text_splitter.split_text(doc['text'])
            for i, chunk in enumerate(chunks):
                split_docs.append(Document(
                    page_content=chunk,
                    metadata={
                        'source': doc.get('file_name', 'Unknown'),
                        'chunk_id': i,
                        **doc.get('metadata', {})
                    }
                ))
        
        if not split_docs:
            logger.warning("No split texts to add after processing.")
            return
        
        logger.info(f"Adding {len(split_docs)} chunks to the vector store")
        
        batch_size = 100
        with tqdm(total=len(split_docs), desc="Adding to vector store", unit="chunk") as pbar:
            for i in range(0, len(split_docs), batch_size):
                batch = split_docs[i:i+batch_size]
                if self.vectorstore is None:
                    self.vectorstore = Chroma.from_documents(
                        documents=batch,
                        embedding=self.embedding_model,
                        persist_directory=self.persist_directory,
                        collection_name='FinSageChatbot'                       
                    )
                else:
                    self.vectorstore.add_documents(batch)
                pbar.update(len(batch))

    def search(self, query: str, k: int = 5) -> List[Document]:
        logger.info(f"Searching for query: {query}")
        return self.vectorstore.similarity_search(query, k=k)

    def save(self):
            logger.info(f"Saving vector store to {self.persist_directory}")
            if self.vectorstore:
                try:
                    self.vectorstore.persist()
                    logger.info("Vector store saved successfully")
                except Exception as e:
                    logger.error(f"Failed to save vector store: {str(e)}")
                    logger.error(traceback.format_exc())
            else:
                logger.warning("No vector store to save")

    @classmethod
    def load(cls, persist_directory: str = r"finsage\backend\app\data\vector_database\chroma_db"):
        logger.info(f"Loading vector store from {persist_directory}")
        instance = cls(persist_directory=persist_directory)
        instance.vectorstore = Chroma(persist_directory=persist_directory, embedding_function=instance.embedding_model, collection_name='JFM_Chatbot' )
        logger.info("Vector store loaded successfully")
        return instance
    
    def search_with_scores(self, query: str, k: int = 5) -> List[Tuple[Document, float]]:
        logger.info(f"Searching for query with scores: {query}")
        results = self.vectorstore.similarity_search_with_score(query, k=k)
        return results
    