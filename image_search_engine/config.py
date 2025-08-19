import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    UNSPLASH_ACCESS_KEY = os.getenv('UNSPLASH_ACCESS_KEY')
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key-123')