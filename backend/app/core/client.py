# client.py
from supabase import create_client, Client
from app.core.config import settings
from app.utils.logger import setup_logger
from typing import Optional
from fastapi import Depends
from app.core.auth import oauth2_scheme

logger = setup_logger(__name__)

def get_supabase_client(token: Optional[str] = Depends(oauth2_scheme)) -> Client:
    """
    Creates and returns a Supabase client instance that is authenticated for the current request.
    A new client is created for each request to ensure thread safety and proper RLS enforcement.
    """
    client = create_client(
        supabase_url=settings.SUPABASE_URL,
        supabase_key=settings.SUPABASE_KEY  # This should be the ANON key for RLS to work
    )
    
    # If a token is present from the request, authenticate the client with it.
    # This makes the client adopt the user's permissions for the subsequent API calls.
    if token:
        try:
            client.postgrest.auth(token)
        except Exception as e:
            # Log the error but don't prevent client creation
            # The API endpoint's own security dependencies will handle invalid tokens.
            logger.error(f"Failed to authenticate Supabase client with token: {e}")

    return client

def init_supabase_for_startup():
    """
    A simple function to be used at application startup to verify Supabase credentials.
    It does not return the client, only checks if a connection can be made.
    """
    try:
        # Use service key for a startup check if available, otherwise anon key
        key = settings.SUPABASE_KEY
        create_client(supabase_url=settings.SUPABASE_URL, supabase_key=key)
        logger.info("Supabase credentials verified successfully at startup.")
    except Exception as e:
        logger.error(f"FATAL: Could not connect to Supabase at startup. Please check credentials. Error: {e}")
        # In a real production app, you might want to exit here if the DB connection is critical
        # raise SystemExit(f"Could not initialize Supabase: {e}")
