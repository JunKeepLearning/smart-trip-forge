import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional
from app.core.client import get_supabase_client
from app.core.auth import get_current_user_id
from supabase import Client

router = APIRouter()

# Pydantic Models
class ChecklistItem(BaseModel):
    id: uuid.UUID
    name: str
    quantity: int
    checked: bool
    notes: Optional[str] = None

class ChecklistCategory(BaseModel):
    id: uuid.UUID
    name: str
    icon: Optional[str] = None
    items: List[ChecklistItem] = Field(default_factory=list)

class ChecklistResponse(BaseModel):
    id: uuid.UUID
    name: str
    tags: List[str] = Field(default_factory=list)
    categories: List[ChecklistCategory] = Field(default_factory=list)

class ChecklistInfo(BaseModel):
    id: uuid.UUID
    name: str
    tags: List[str]


@router.get("/", response_model=List[ChecklistInfo])
def get_all_checklists(db: Client = Depends(get_supabase_client), user_id: str = Depends(get_current_user_id)):
    """
    Fetches a list of all checklists for the currently authenticated user.
    """
    try:
        response = db.table("checklists").select("id, name, tags").eq("user_id", user_id).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")


@router.put("/{checklist_id}")
def sync_checklist_data(checklist_id: uuid.UUID, request_data: ChecklistUpdateRequest, db: Client = Depends(get_supabase_client), user_id: str = Depends(get_current_user_id)):
    """
    Synchronizes a checklist with the provided data.
    This endpoint calls a PostgreSQL function to handle the complex logic
    of inserting, updating, and deleting nested categories and items.
    """
    try:
        # Call the RPC function in the database
        db.rpc('sync_checklist', {
            'p_checklist_id': str(checklist_id),
            'p_user_id': user_id,
            'p_data': request_data.model_dump_json() # Use model_dump_json() for Pydantic v2
        }).execute()
        
        return {"message": "Checklist synchronized successfully"}
    except Exception as e:
        # This could catch exceptions from the RPC call, e.g., permission denied
        raise HTTPException(status_code=500, detail=f"Failed to synchronize checklist: {str(e)}")


@router.get("/{checklist_id}", response_model=ChecklistResponse)
def get_checklist_details(checklist_id: uuid.UUID, db: Client = Depends(get_supabase_client), user_id: str = Depends(get_current_user_id)):
    """
    Fetches the complete details for a single checklist, ensuring it belongs to the authenticated user.
    """
    try:
        response = db.table("checklists").select(
            "*",
            "checklist_categories(*, checklist_items(*))"
        ).eq("id", str(checklist_id)).eq("user_id", user_id).single().execute()

        if not response.data:
            raise HTTPException(status_code=404, detail="Checklist not found or access denied")

        return response.data
    
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")