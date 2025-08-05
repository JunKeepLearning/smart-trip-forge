from fastapi import APIRouter, HTTPException
from app.core.client import get_supabase_client

router = APIRouter()
supabase = get_supabase_client()

@router.get("/museums")
def get_museums():
    try:
        response = supabase.table("museums").select("*").limit(10).execute()
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))