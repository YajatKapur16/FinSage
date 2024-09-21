from huggingface_hub import login
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get the Hugging Face token from environment variable
hf_token = os.getenv('HUGGINGFACE_TOKEN')

# Login to Hugging Face Hub
if hf_token:
    login(token=hf_token)
else:
    raise ValueError("HUGGINGFACE_TOKEN not found in environment variables")