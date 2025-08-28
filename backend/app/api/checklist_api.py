import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from app.core.client import get_supabase_client
from app.core.auth import require_user, optional_user
from supabase import Client

router = APIRouter()

# --- Helpers for Ownership Verification ---

def _verify_user_owns_checklist(db: Client, user_id: str, checklist_id: str):
    """Verify the user owns the checklist. Raise HTTPException if not."""
    res = db.table("checklists").select("id").eq("id", checklist_id).eq("user_id", user_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Checklist not found or access denied.")

def _verify_user_owns_category(db: Client, user_id: str, category_id: str):
    """Verify the user owns the category. Raise HTTPException if not."""
    res = db.table("checklist_categories").select("id, checklists(user_id)").eq("id", category_id).single().execute()
    if not res.data or res.data['checklists']['user_id'] != user_id:
        raise HTTPException(status_code=404, detail="Category not found or access denied.")
    return res.data

def _verify_user_owns_item(db: Client, user_id: str, item_id: str):
    """Verify the user owns the item. Raise HTTPException if not."""
    res = db.table("checklist_items").select("id, checklist_categories(checklists(user_id))").eq("id", item_id).single().execute()
    if not res.data or res.data['checklist_categories']['checklists']['user_id'] != user_id:
        raise HTTPException(status_code=404, detail="Item not found or access denied.")

# --- Pydantic Models ---

class ChecklistItem(BaseModel):
    id: uuid.UUID
    name: str
    quantity: int
    checked: bool
    notes: Optional[str] = None
    category_id: uuid.UUID

class ChecklistCategory(BaseModel):
    id: uuid.UUID
    name: str
    icon: Optional[str] = None
    items: List[ChecklistItem] = Field(default_factory=list)

class ChecklistCreateRequest(BaseModel):
    name: str
    tags: List[str] = Field(default_factory=list)

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
    items_count: int = 0
    items_checked_count: int = 0

# Models for Granular Operations
class CategoryCreate(BaseModel):
    name: str
    icon: Optional[str] = None

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None

class ItemCreate(BaseModel):
    name: str
    quantity: int = 1

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[int] = None
    checked: Optional[bool] = None
    notes: Optional[str] = None


# --- Main Checklist Endpoints ---

@router.get("/", response_model=List[ChecklistInfo])
def get_all_checklists(db: Client = Depends(get_supabase_client), user_id: Optional[str] = Depends(optional_user)):
    try:
        query = db.table("checklists").select("id, name, tags, is_template, items_count, items_checked_count")
        if user_id:
            query = query.eq("user_id", user_id)
        else:
            query = query.eq("is_template", True)
        response = query.order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=ChecklistInfo, status_code=status.HTTP_201_CREATED)
def create_checklist(req: ChecklistCreateRequest, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    try:
        response = db.table("checklists").insert({
            "name": req.name,
            "tags": req.tags,
            "user_id": user_id
        }).execute()
        if not response.data:
            raise HTTPException(status_code=403, detail="Failed to create checklist, possibly due to RLS policy.")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{checklist_id}", response_model=ChecklistResponse)
def get_checklist_details(checklist_id: uuid.UUID, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    try:
        response = db.table("checklists").select("*, checklist_categories(*, checklist_items(*))").eq("id", str(checklist_id)).eq("user_id", user_id).single().execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Checklist not found or access denied")
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{checklist_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_checklist(checklist_id: uuid.UUID, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    _verify_user_owns_checklist(db, user_id, str(checklist_id))
    try:
        db.table("checklists").delete().eq("id", str(checklist_id)).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete checklist: {str(e)}")

# --- Granular Category Endpoints ---

@router.post("/checklists/{checklist_id}/categories", response_model=ChecklistCategory, status_code=status.HTTP_201_CREATED)
def create_category_for_checklist(checklist_id: uuid.UUID, req: CategoryCreate, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    _verify_user_owns_checklist(db, user_id, str(checklist_id))
    try:
        res = db.table("checklist_categories").insert({
            "checklist_id": str(checklist_id),
            "name": req.name,
            "icon": req.icon
        }).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to create category.")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/categories/{category_id}", response_model=ChecklistCategory)
def update_category(category_id: uuid.UUID, req: CategoryUpdate, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    _verify_user_owns_category(db, user_id, str(category_id))
    try:
        update_data = req.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided.")
        res = db.table("checklist_categories").update(update_data).eq("id", str(category_id)).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to update category.")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: uuid.UUID, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    _verify_user_owns_category(db, user_id, str(category_id))
    try:
        db.table("checklist_categories").delete().eq("id", str(category_id)).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete category: {str(e)}")

# --- Granular Item Endpoints ---

@router.post("/categories/{category_id}/items", response_model=ChecklistItem, status_code=status.HTTP_201_CREATED)
def create_item_for_category(category_id: uuid.UUID, req: ItemCreate, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    _verify_user_owns_category(db, user_id, str(category_id))
    try:
        res = db.table("checklist_items").insert({
            "category_id": str(category_id),
            "name": req.name,
            "quantity": req.quantity
        }).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to create item.")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/items/{item_id}", response_model=ChecklistItem)
def update_item(item_id: uuid.UUID, req: ItemUpdate, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    _verify_user_owns_item(db, user_id, str(item_id))
    try:
        update_data = req.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided.")
        res = db.table("checklist_items").update(update_data).eq("id", str(item_id)).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to update item.")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: uuid.UUID, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    _verify_user_owns_item(db, user_id, str(item_id))
    try:
        db.table("checklist_items").delete().eq("id", str(item_id)).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete item: {str(e)}")