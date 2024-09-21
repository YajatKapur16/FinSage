from typing import List, Dict, Optional
from core.language_model import AdvancedLanguageModel, LLMResponse
from core.prompt_engine import FinSagePromptEngine
from langchain.schema import Document

class ResponseGenerator:
    def __init__(self, language_model: AdvancedLanguageModel, prompt_engine: FinSagePromptEngine):
        self.language_model = language_model
        self.prompt_engine = prompt_engine

    def generate(self, user_query: str, relevant_docs: List[Document], conversation_history: Optional[List[Dict[str, str]]] = None) -> LLMResponse:
        relevant_info = "\n".join([doc.page_content for doc in relevant_docs])
        prompt = self.prompt_engine.create_prompt(user_query, relevant_info, conversation_history)
        response = self.language_model.generate_response(prompt)
        return response