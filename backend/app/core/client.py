# client.py
from supabase import create_client, Client
from app.core.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)

# Create the singleton Supabase client instance directly.
# This instance will be shared across the entire application.
try:
    supabase_client: Client = create_client(
        supabase_url=settings.SUPABASE_URL,
        supabase_key=settings.SUPABASE_KEY
    )
    logger.info("Supabase client initialized successfully.")
except Exception as e:
    logger.error(f"Fatal: Failed to initialize Supabase client: {str(e)}")
    # Re-raise the exception to prevent the application from starting
    # with a non-functional database connection.
    raise e

# A getter function for FastAPI's dependency injection.
# This allows us to easily use the client in API routes.
def get_supabase_client() -> Client:
    return supabase_client
