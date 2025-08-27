# client.py
from supabase import create_client, Client
from app.core.config import settings
from app.utils.logger import setup_logger
from typing import Optional

logger = setup_logger(__name__)

supabase_client: Optional[Client] = None

def get_supabase_client() -> Client:
    """
    Returns the Supabase client.
    Raises an exception if the client is not initialized.
    """
    if supabase_client is None:
        raise RuntimeError("Supabase client has not been initialized.")
    return supabase_client

def init_supabase_client():
    """
    Initializes the Supabase client.
    """
    global supabase_client
    try:
        supabase_client = create_client(
            supabase_url=settings.SUPABASE_URL,
            supabase_key=settings.SUPABASE_KEY
        )
        logger.info("Supabase client initialized successfully.")
    except Exception as e:
        logger.error(f"Fatal: Failed to initialize Supabase client: {str(e)}")
        raise e
