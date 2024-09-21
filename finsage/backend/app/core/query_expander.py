from typing import List
from core.language_model import AdvancedLanguageModel

class QueryExpander:
    def __init__(self, model: AdvancedLanguageModel):
        self.model = model

    def expand_query(self, query: str, num_expansions: int = 3) -> List[str]:
        prompt = f"Expand the following finance-related query into {num_expansions} more specific questions that capture more intricate aspects: {query}"
        response = self.model.generate_response(prompt)
        expanded_queries = response.text.split('\n')[:num_expansions]
        return [q.strip() for q in expanded_queries if q.strip()]