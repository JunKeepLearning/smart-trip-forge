from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from supabase import Client
from typing import List

from app.core.client import get_supabase_client
from app.core.auth import get_current_user

router = APIRouter()

class FavoriteItem(BaseModel):
    item_id: str
    item_type: str

@router.post("/favorites", status_code=201)
async def add_favorite(
    favorite: FavoriteItem,
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """Adds an item to the user's favorites."""
    user_id = user['id']
    try:
        response = await supabase.from_("user_favorites").insert({
            "user_id": user_id,
            "item_id": favorite.item_id,
            "item_type": favorite.item_type
        }).execute()

        if response.data:
            return response.data[0]
        else:
            # This part handles potential errors not caught by exception, like RLS issues
            raise HTTPException(status_code=400, detail="Failed to add favorite.")

    except Exception as e:
        # Handles unique constraint violation (item already favorited)
        if '23505' in str(e): # 23505 is the PostgreSQL error code for unique_violation
            raise HTTPException(status_code=409, detail="Item already in favorites.")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/favorites", response_model=List[FavoriteItem])
async def get_favorites(
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """Gets all favorite items for the current user."""
    user_id = user['id']
    response = await supabase.from_("user_favorites").select("item_id, item_type").eq("user_id", user_id).execute()
    return response.data

@router.delete("/favorites", status_code=204)
async def remove_favorite(
    item_id: str = Query(...),
    item_type: str = Query(...),
    user: dict = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """Removes an item from the user's favorites using query parameters."""
    user_id = user['id']
    response = await supabase.from_("user_favorites").delete().match({
        "user_id": user_id,
        "item_id": item_id,
        "item_type": item_type
    }).execute()

    # The delete operation doesn't fail if the item doesn't exist, which is fine.
    # No content is returned on successful deletion.
    return
