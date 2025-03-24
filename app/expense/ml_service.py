import os
import torch
import torch.nn as nn
from transformers import BertTokenizer, BertForTokenClassification
from typing import Tuple
import logging
import traceback
from torch.serialization import add_safe_globals
import re
from pathlib import Path

logger = logging.getLogger(__name__)

# Default categories - these should be synced with database
DEFAULT_CATEGORIES = [
    "Food", "Groceries", "Parking", "Dining", "Entertainment", "Fuel",
    "Shopping", "Rent", "Utilities", "Electronics", "Clothing", "Charity",
    "Transportation", "Subscription", "Healthcare", "Travel", "Fitness and Sports",
    "Home", "Business", "Education", "Beauty", "Gifts", "Insurance",
    "Taxes", "Loan Repayment", "Savings", "Miscellaneous", "Pet Care",
    "Hobbies", "Books"
]

class ExpenseMLService:
    """Service for expense predictions using BERT model"""

    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        possible_paths = [
            os.environ.get("MODEL_PATH", "expense_model.pt"),
            "expense_model.pt",
        ]
        
        self.model_path = None
        for path in possible_paths:
            if path and os.path.exists(path):
                self.model_path = path
                logger.info(f"Using model at: {os.path.abspath(path)}")
                break
        
        if not self.model_path:
            self.model_path = "expense_model.pt"
            logger.warning(f"No model found, using default path: {os.path.abspath(self.model_path)}")
            
        self.tokenizer = None
        self.model = None
        self.categories = DEFAULT_CATEGORIES
        self.is_loaded = False
        self.load_attempts = 0
        self.max_load_attempts = 3
        self.dropout_rate = 0.1

    def load_model(self) -> bool:
        """Load the BERT model and tokenizer"""
        if self.is_loaded:
            return True

        if self.load_attempts >= self.max_load_attempts:
            logger.error(f"Maximum model load attempts reached")
            return False

        self.load_attempts += 1
        
        if not os.path.exists(self.model_path):
            logger.error(f"Model file not found at {os.path.abspath(self.model_path)}")
            return False

        try:
            # Initialize tokenizer
            self.tokenizer = BertTokenizer.from_pretrained("bert-base-uncased")
            
            # Add BertForTokenClassification to safe globals and load model
            add_safe_globals([BertForTokenClassification])
            try:
                self.model = torch.load(self.model_path, map_location=self.device, weights_only=False)
            except Exception as e:
                logger.warning(f"Failed to load full model, creating fresh model")
                num_labels = len(self.categories)
                self.model = BertForTokenClassification.from_pretrained(
                    "bert-base-uncased",
                    num_labels=num_labels
                )
                self.model.classifier = nn.Sequential(
                    nn.Dropout(self.dropout_rate),
                    nn.Linear(self.model.config.hidden_size, num_labels)
                )

            self.model.to(self.device)
            self.model.eval()
            self.is_loaded = True
            return True

        except Exception as e:
            logger.error(f"Error loading model: {str(e)}")
            return False

    def predict_category(self, description: str) -> str:
        """Predict the category of an expense description"""
        if not self.is_loaded and not self.load_model():
            logger.error("Failed to load model")
            return "Miscellaneous"

        try:
            if not description or not isinstance(description, str):
                return "Miscellaneous"

            inputs = self.tokenizer(
                description,
                padding=True,
                truncation=True,
                max_length=512,
                return_tensors="pt"
            ).to(self.device)

            with torch.no_grad():
                outputs = self.model(**inputs)
                logits = outputs.logits
                predictions = torch.mean(logits, dim=1).argmax(dim=1).cpu().numpy()[0]
                category = self.categories[predictions]
                
            return category

        except Exception as e:
            logger.error(f"Error during prediction: {str(e)}")
            return "Miscellaneous"

    def extract_amount(self, description: str) -> float:
        """Extract amount from the description"""
        patterns = [
            r'\$?(\d+(?:\.\d{1,2})?)',  # Matches amounts like $123.45 or 123.45
            r'(?:USD|EUR|GBP|INR)?\s*(\d+(?:\.\d{1,2})?)',  # Matches amounts with currency codes
        ]

        for pattern in patterns:
            match = re.search(pattern, description)
            if match:
                try:
                    return float(match.group(1))
                except ValueError:
                    continue

        return 0.0

    def predict_expense(self, description: str) -> Tuple[str, float]:
        """Predict both category and amount from description"""
        category = self.predict_category(description)
        amount = self.extract_amount(description)
        logger.info(f"Expense prediction: '{description}' → Category: {category}, Amount: {amount}")
        return category, amount

# Create a singleton instance
expense_ml_service = ExpenseMLService()

# Try to load the model immediately to catch any issues early
logger.info("Initializing ML service and attempting to load model")
success = expense_ml_service.load_model()
logger.info(f"Initial model loading {'successful' if success else 'failed'}")