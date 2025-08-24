from fastapi import APIRouter, HTTPException, Query
from app.core.client import get_supabase_client
import json

router = APIRouter()
supabase = get_supabase_client()

# Hardcoded data for demonstration purposes
with open('data/destinations.json', 'r', encoding='utf-8') as f:
    destinations_data = json.load(f)

@router.get("/search/destinations")
def search_destinations(q: str = Query(None, min_length=1)):
    if q is None:
        return []
    
    # Case-insensitive search
    search_term = q.lower()
    
    results = [
        dest for dest in destinations_data 
        if search_term in dest['city'].lower() or search_term in dest['country'].lower()
    ]
    
    return results[:10] # Return top 10 matches

@router.get("/museums")
def get_museums():
    try:
        response = supabase.table("museums").select("*").limit(10).execute()
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
