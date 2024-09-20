from dataclasses import dataclass
from typing import Dict, Any
import google.generativeai as genai
from tenacity import retry, stop_after_attempt, wait_random_exponential
from utils.logging import logger

@dataclass
class LLMResponse:
    text: str
    metadata: Dict[str, Any]

import google.generativeai as genai

class AdvancedLanguageModel:
    def __init__(self, model_config: Dict[str, Any]):
        logger.info(f"Initializing AdvancedLanguageModel with config: {model_config}")
        self.model_config = model_config
        
        genai.configure(api_key=model_config['api_key'])
        self.model = genai.GenerativeModel(model_config['model_name'])
        
        logger.info("AdvancedLanguageModel initialized successfully")

    @retry(wait=wait_random_exponential(min=1, max=60), stop=stop_after_attempt(3))
    def generate_response(self, prompt: str) -> LLMResponse:
        try:
            response = self.model.generate_content(prompt, generation_config={
                "temperature": 0.4, 
                "top_p": 0.9,
                "top_k": 50,
                "max_output_tokens": 1024,
            })
            model_response = response.text
            
            # # Ensure the response doesn't contain hallucinated information
            # if "I don't have enough information" not in model_response and "Based on the provided information" not in model_response:
            #     model_response = "Based on the provided information, " + model_response
            
            if len(model_response.split()) < 10:  # Check if response is too short
                model_response = "I apologize, but I don't have enough information to provide a comprehensive answer. " + model_response
            
            metadata = {
                "model_name": self.model_config['model_name'],
                "prompt_length": len(prompt),
                "response_length": len(model_response)
            }
            
            return LLMResponse(text=model_response, metadata=metadata)
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            raise
        

class LanguageModelFactory:
    @staticmethod
    def create_model(**kwargs) -> AdvancedLanguageModel:
        config = {
            "model_name": "gemini-1.5-flash",
            "api_key": "AIzaSyC3_Sng2_zMoz-pwKl7bBUfqZoFy_DBwHQ",
            **kwargs
        }
        
        return AdvancedLanguageModel(config)
