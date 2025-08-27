import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from app.core.client import get_supabase_client
from app.core.auth import require_user, optional_user
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

class ChecklistCreateRequest(BaseModel):
    name: str
    tags: List[str] = Field(default_factory=list)
    # Optional: To create from a template, pass categories
    categories: List[ChecklistCategory] = Field(default_factory=list)

class ChecklistUpdateRequest(BaseModel):
    name: str
    tags: List[str] = Field(default_factory=list)
    categories: List[ChecklistCategory] = Field(default_factory=list)

class ChecklistResponse(BaseModel):
    id: uuid.UUID
    name: str
    tags: List[str] = Field(default_factory=list)
    categories: List[ChecklistCategory] = Field(default_factory=list)

class ChecklistInfo(BaseModel):
    id: uuid.UUID
    name: str
    tags: List[str]
    is_template: bool = False


@router.get("/", response_model=List[ChecklistInfo])
def get_all_checklists(db: Client = Depends(get_supabase_client), user_id: Optional[str] = Depends(optional_user)):
    """
    Fetches a list of checklists.
    - If the user is authenticated, it returns their private checklists.
    - If the user is anonymous, it returns public templates.
    """
    try:
        query = db.table("checklists").select("id, name, tags, is_template")
        if user_id:
            # Authenticated user gets their own checklists
            query = query.eq("user_id", user_id)
        else:
            # Anonymous user gets only templates
            query = query.eq("is_template", True)
        
        response = query.order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")

@router.post("/", response_model=ChecklistInfo, status_code=status.HTTP_201_CREATED)
def create_checklist(request_data: ChecklistCreateRequest, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """
    Creates a new checklist for the authenticated user.
    """
    try:
        # Insert the new checklist and get the ID
        response = db.table("checklists").insert({
            "name": request_data.name,
            "tags": request_data.tags,
            "user_id": user_id
        }).execute()
        
        new_checklist = response.data[0]
        new_checklist_id = new_checklist['id']

        # If categories were provided (e.g., from a template), sync them
        if request_data.categories:
            # We can reuse the sync function logic by wrapping it
            sync_data = {
                "name": request_data.name,
                "tags": request_data.tags,
                "categories": [cat.model_dump() for cat in request_data.categories]
            }
            db.rpc('sync_checklist', {
                'p_checklist_id': new_checklist_id,
                'p_user_id': user_id,
                'p_data': sync_data
            }).execute()

        return new_checklist

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create checklist: {str(e)}")


@router.put("/{checklist_id}", status_code=status.HTTP_204_NO_CONTENT)
def sync_checklist_data(checklist_id: uuid.UUID, request_data: ChecklistUpdateRequest, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
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
            'p_data': request_data.model_dump()
        }).execute()
        
    except Exception as e:
        # This could catch exceptions from the RPC call, e.g., permission denied
        raise HTTPException(status_code=500, detail=f"Failed to synchronize checklist: {str(e)}")


@router.get("/{checklist_id}", response_model=ChecklistResponse)
def get_checklist_details(checklist_id: uuid.UUID, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
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

@router.delete("/{checklist_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_checklist(checklist_id: uuid.UUID, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """
    Deletes a checklist for the authenticated user.
    RLS policies ensure the user can only delete their own checklists.
    """
    try:
        # The delete operation will respect RLS, so we don't need to check ownership explicitly here.
        # If the user doesn't own it, Supabase will prevent the deletion.
        db.table("checklists").delete().eq("id", str(checklist_id)).execute()

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete checklist: {str(e)}")
