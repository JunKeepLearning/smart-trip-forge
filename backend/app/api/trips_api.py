import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from app.core.client import get_supabase_client
from app.core.auth import require_user
from supabase import Client

# 创建API路由实例，用于定义行程相关的API端点
router = APIRouter()

# --- Pydantic数据模型 ---

class ItineraryItem(BaseModel):
    """日程项目数据模型"""
    id: uuid.UUID
    time: Optional[str] = None
    type: str = "custom"
    name: str
    notes: Optional[str] = None

class ItineraryDay(BaseModel):
    """日程天数据模型"""
    id: uuid.UUID
    day_number: int
    date: str
    title: Optional[str] = None
    items: List[ItineraryItem] = Field(default_factory=list)

class Collaborator(BaseModel):
    """协作者数据模型"""
    id: uuid.UUID
    user_id: str
    access_level: str = "viewer"
    name: str
    avatar_url: Optional[str] = None

class TripBase(BaseModel):
    """行程基础数据模型"""
    name: str
    destination: str
    start_date: str
    end_date: str
    description: Optional[str] = None
    status: str = "Not Started"
    thumbnail: Optional[str] = None

class TripCreate(TripBase):
    """创建行程请求数据模型"""
    pass

class TripUpdate(BaseModel):
    """更新行程请求数据模型"""
    name: Optional[str] = None
    destination: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    thumbnail: Optional[str] = None

class TripResponse(TripBase):
    """行程响应数据模型"""
    id: uuid.UUID
    user_id: str
    created_at: str
    updated_at: str
    collaborators: List[Collaborator] = Field(default_factory=list)
    itinerary: List[ItineraryDay] = Field(default_factory=list)

# --- 辅助函数 ---

def _verify_user_has_access_to_trip(db: Client, user_id: str, trip_id: str, required_access_level: str = "viewer"):
    """验证用户是否对指定行程有访问权限。
    
    Args:
        db: Supabase数据库客户端实例
        user_id: 用户ID
        trip_id: 行程ID
        required_access_level: 所需访问级别 (viewer, editor, owner)
    """
    # 查询行程及其协作者信息
    res = db.table("trips").select("user_id").eq("id", trip_id).single().execute()
    
    # 检查行程是否存在
    if not res.data:
        raise HTTPException(status_code=404, detail="Trip not found.")
    
    # 检查用户是否是行程所有者
    if res.data['user_id'] == user_id:
        return True
    
    # 查询协作者信息
    collaborator_res = db.table("trip_collaborators").select("access_level").eq("trip_id", trip_id).eq("user_id", user_id).single().execute()
    
    # 检查用户是否是协作者
    if not collaborator_res.data:
        raise HTTPException(status_code=403, detail="Access denied.")
    
    # 检查访问级别是否满足要求
    access_levels = ["viewer", "editor", "owner"]
    user_access_level = collaborator_res.data['access_level']
    
    if access_levels.index(user_access_level) < access_levels.index(required_access_level):
        raise HTTPException(status_code=403, detail="Insufficient access level.")
    
    return True

# --- 行程管理接口 ---

@router.get("/", response_model=List[TripResponse])
async def get_trips(db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """获取用户的所有行程列表
    
    Args:
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（必需，依赖注入）
        
    Returns:
        List[TripResponse]: 行程响应对象列表
    """
    try:
        # 查询用户拥有的行程和作为协作者参与的行程
        response = db.table("trips").select("*, trip_collaborators(user_id, access_level, users(name, avatar_url))").or_(
            f"user_id.eq.{user_id}",
            f"trip_collaborators.user_id.eq.{user_id}"
        ).order("created_at", desc=True).execute()
        
        # 处理协作者信息
        trips = []
        for trip in response.data:
            collaborators = []
            if trip.get('trip_collaborators'):
                for collab in trip['trip_collaborators']:
                    if collab.get('users'):
                        collaborators.append(Collaborator(
                            id=uuid.uuid4(),  # 这里应该使用数据库中的实际ID
                            user_id=collab['user_id'],
                            access_level=collab['access_level'],
                            name=collab['users'].get('name', ''),
                            avatar_url=collab['users'].get('avatar_url')
                        ))
            
            # 构建行程对象
            trip_obj = TripResponse(
                id=trip['id'],
                user_id=trip['user_id'],
                name=trip['name'],
                destination=trip['destination'],
                start_date=trip['start_date'],
                end_date=trip['end_date'],
                description=trip.get('description'),
                status=trip['status'],
                thumbnail=trip.get('thumbnail'),
                created_at=trip['created_at'],
                updated_at=trip['updated_at'],
                collaborators=collaborators,
                itinerary=[]  # 简化处理，不在列表中返回详细日程
            )
            trips.append(trip_obj)
            
        return trips
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
async def create_trip(trip: TripCreate, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """创建新的行程
    
    Args:
        trip: 行程创建请求对象
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（必需，依赖注入）
        
    Returns:
        TripResponse: 创建的行程响应对象
    """
    try:
        # 向数据库插入新的行程记录
        response = db.table("trips").insert({
            "name": trip.name,
            "destination": trip.destination,
            "start_date": trip.start_date,
            "end_date": trip.end_date,
            "description": trip.description,
            "status": trip.status,
            "thumbnail": trip.thumbnail,
            "user_id": user_id
        }).execute()
        
        # 检查是否成功创建行程
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to create trip.")
        
        # 构建响应对象
        created_trip = response.data[0]
        trip_response = TripResponse(
            id=created_trip['id'],
            user_id=created_trip['user_id'],
            name=created_trip['name'],
            destination=created_trip['destination'],
            start_date=created_trip['start_date'],
            end_date=created_trip['end_date'],
            description=created_trip.get('description'),
            status=created_trip['status'],
            thumbnail=created_trip.get('thumbnail'),
            created_at=created_trip['created_at'],
            updated_at=created_trip['updated_at'],
            collaborators=[],
            itinerary=[]
        )
        
        return trip_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{trip_id}", response_model=TripResponse)
async def get_trip_details(trip_id: uuid.UUID, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """获取特定行程的详细信息
    
    Args:
        trip_id: 行程ID
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（必需，依赖注入）
        
    Returns:
        TripResponse: 行程响应对象
    """
    try:
        # 验证用户是否有访问权限
        _verify_user_has_access_to_trip(db, user_id, str(trip_id))
        
        # 查询行程详细信息，包括协作者和日程
        response = db.table("trips").select("""
            *,
            trip_collaborators(user_id, access_level, users(name, avatar_url)),
            itinerary_days(
                *,
                itinerary_items(*)
            )
        """).eq("id", str(trip_id)).single().execute()
        
        # 检查行程是否存在
        if not response.data:
            raise HTTPException(status_code=404, detail="Trip not found.")
        
        trip = response.data
        
        # 处理协作者信息
        collaborators = []
        if trip.get('trip_collaborators'):
            for collab in trip['trip_collaborators']:
                if collab.get('users'):
                    collaborators.append(Collaborator(
                        id=uuid.uuid4(),  # 这里应该使用数据库中的实际ID
                        user_id=collab['user_id'],
                        access_level=collab['access_level'],
                        name=collab['users'].get('name', ''),
                        avatar_url=collab['users'].get('avatar_url')
                    ))
        
        # 处理日程信息
        itinerary = []
        if trip.get('itinerary_days'):
            for day in trip['itinerary_days']:
                items = []
                if day.get('itinerary_items'):
                    for item in day['itinerary_items']:
                        items.append(ItineraryItem(
                            id=item['id'],
                            time=item.get('time'),
                            type=item.get('type', 'custom'),
                            name=item['name'],
                            notes=item.get('notes')
                        ))
                
                itinerary.append(ItineraryDay(
                    id=day['id'],
                    day_number=day['day_number'],
                    date=day['date'],
                    title=day.get('title'),
                    items=items
                ))
        
        # 构建响应对象
        trip_response = TripResponse(
            id=trip['id'],
            user_id=trip['user_id'],
            name=trip['name'],
            destination=trip['destination'],
            start_date=trip['start_date'],
            end_date=trip['end_date'],
            description=trip.get('description'),
            status=trip['status'],
            thumbnail=trip.get('thumbnail'),
            created_at=trip['created_at'],
            updated_at=trip['updated_at'],
            collaborators=collaborators,
            itinerary=itinerary
        )
        
        return trip_response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{trip_id}", response_model=TripResponse)
async def update_trip(trip_id: uuid.UUID, trip_update: TripUpdate, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """更新行程信息
    
    Args:
        trip_id: 要更新的行程ID
        trip_update: 行程更新请求对象
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（必需，依赖注入）
        
    Returns:
        TripResponse: 更新后的行程响应对象
    """
    try:
        # 验证用户是否有编辑权限
        _verify_user_has_access_to_trip(db, user_id, str(trip_id), "editor")
        
        # 获取请求中非空的更新数据
        update_data = trip_update.model_dump(exclude_unset=True)
        
        # 检查是否有更新数据
        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided.")
        
        # 更新数据库中的行程记录
        response = db.table("trips").update(update_data).eq("id", str(trip_id)).execute()
        
        # 检查是否成功更新行程
        if not response.data:
            raise HTTPException(status_code=404, detail="Trip not found.")
        
        # 获取更新后的行程信息
        updated_trip = response.data[0]
        
        # 构建响应对象
        trip_response = TripResponse(
            id=updated_trip['id'],
            user_id=updated_trip['user_id'],
            name=updated_trip['name'],
            destination=updated_trip['destination'],
            start_date=updated_trip['start_date'],
            end_date=updated_trip['end_date'],
            description=updated_trip.get('description'),
            status=updated_trip['status'],
            thumbnail=updated_trip.get('thumbnail'),
            created_at=updated_trip['created_at'],
            updated_at=updated_trip['updated_at'],
            collaborators=[],
            itinerary=[]
        )
        
        return trip_response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{trip_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trip(trip_id: uuid.UUID, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """删除行程
    
    Args:
        trip_id: 要删除的行程ID
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（必需，依赖注入）
    """
    try:
        # 验证用户是否是行程所有者
        _verify_user_has_access_to_trip(db, user_id, str(trip_id), "owner")
        
        # 从数据库中删除行程记录
        response = db.table("trips").delete().eq("id", str(trip_id)).execute()
        
        # 检查是否成功删除行程
        if not response.data:
            raise HTTPException(status_code=404, detail="Trip not found.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 协作者管理接口 ---

@router.get("/{trip_id}/collaborators", response_model=List[Collaborator])
async def get_collaborators(trip_id: uuid.UUID, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """获取行程的协作者列表
    
    Args:
        trip_id: 行程ID
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（必需，依赖注入）
        
    Returns:
        List[Collaborator]: 协作者列表
    """
    try:
        # 验证用户是否有访问权限
        _verify_user_has_access_to_trip(db, user_id, str(trip_id))
        
        # 查询协作者信息
        response = db.table("trip_collaborators").select("user_id, access_level, users(name, avatar_url)").eq("trip_id", str(trip_id)).execute()
        
        # 处理协作者信息
        collaborators = []
        for collab in response.data:
            if collab.get('users'):
                collaborators.append(Collaborator(
                    id=uuid.uuid4(),  # 这里应该使用数据库中的实际ID
                    user_id=collab['user_id'],
                    access_level=collab['access_level'],
                    name=collab['users'].get('name', ''),
                    avatar_url=collab['users'].get('avatar_url')
                ))
        
        return collaborators
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{trip_id}/collaborators", response_model=Collaborator, status_code=status.HTTP_201_CREATED)
async def add_collaborator(trip_id: uuid.UUID, user_id_to_add: str, access_level: str = "viewer", db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """添加协作者
    
    Args:
        trip_id: 行程ID
        user_id_to_add: 要添加的用户ID
        access_level: 访问级别 (viewer, editor, owner)
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 当前用户ID（必需，依赖注入）
        
    Returns:
        Collaborator: 添加的协作者信息
    """
    try:
        # 验证当前用户是否是行程所有者
        _verify_user_has_access_to_trip(db, user_id, str(trip_id), "owner")
        
        # 检查要添加的用户是否已经是协作者
        existing_collab = db.table("trip_collaborators").select("id").eq("trip_id", str(trip_id)).eq("user_id", user_id_to_add).execute()
        if existing_collab.data:
            raise HTTPException(status_code=400, detail="User is already a collaborator.")
        
        # 添加协作者
        response = db.table("trip_collaborators").insert({
            "trip_id": str(trip_id),
            "user_id": user_id_to_add,
            "access_level": access_level
        }).execute()
        
        # 检查是否成功添加协作者
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to add collaborator.")
        
        # 构建响应对象
        collaborator = response.data[0]
        collaborator_response = Collaborator(
            id=collaborator['id'],
            user_id=collaborator['user_id'],
            access_level=collaborator['access_level'],
            name="",  # 简化处理，实际应用中应查询用户信息
            avatar_url=None
        )
        
        return collaborator_response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{trip_id}/collaborators/{user_id_to_remove}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_collaborator(trip_id: uuid.UUID, user_id_to_remove: str, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """移除协作者
    
    Args:
        trip_id: 行程ID
        user_id_to_remove: 要移除的用户ID
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 当前用户ID（必需，依赖注入）
    """
    try:
        # 验证当前用户是否是行程所有者
        _verify_user_has_access_to_trip(db, user_id, str(trip_id), "owner")
        
        # 检查要移除的用户是否是协作者
        collaborator = db.table("trip_collaborators").select("id").eq("trip_id", str(trip_id)).eq("user_id", user_id_to_remove).execute()
        if not collaborator.data:
            raise HTTPException(status_code=404, detail="User is not a collaborator.")
        
        # 移除协作者
        response = db.table("trip_collaborators").delete().eq("trip_id", str(trip_id)).eq("user_id", user_id_to_remove).execute()
        
        # 检查是否成功移除协作者
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to remove collaborator.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 日程天管理接口 ---

@router.get("/{trip_id}/days", response_model=List[ItineraryDay])
async def get_itinerary_days(trip_id: uuid.UUID, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """获取行程的所有日程天
    
    Args:
        trip_id: 行程ID
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（必需，依赖注入）
        
    Returns:
        List[ItineraryDay]: 日程天列表
    """
    try:
        # 验证用户是否有访问权限
        _verify_user_has_access_to_trip(db, user_id, str(trip_id))
        
        # 查询日程天信息
        response = db.table("itinerary_days").select("*, itinerary_items(*)").eq("trip_id", str(trip_id)).order("day_number").execute()
        
        # 处理日程天信息
        days = []
        for day in response.data:
            items = []
            if day.get('itinerary_items'):
                for item in day['itinerary_items']:
                    items.append(ItineraryItem(
                        id=item['id'],
                        time=item.get('time'),
                        type=item.get('type', 'custom'),
                        name=item['name'],
                        notes=item.get('notes')
                    ))
            
            days.append(ItineraryDay(
                id=day['id'],
                day_number=day['day_number'],
                date=day['date'],
                title=day.get('title'),
                items=items
            ))
        
        return days
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{trip_id}/days", response_model=ItineraryDay, status_code=status.HTTP_201_CREATED)
async def add_itinerary_day(trip_id: uuid.UUID, day_number: int, date: str, title: Optional[str] = None, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """添加新的日程天
    
    Args:
        trip_id: 行程ID
        day_number: 天数
        date: 日期
        title: 标题（可选）
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（必需，依赖注入）
        
    Returns:
        ItineraryDay: 添加的日程天信息
    """
    try:
        # 验证用户是否有编辑权限
        _verify_user_has_access_to_trip(db, user_id, str(trip_id), "editor")
        
        # 添加日程天
        response = db.table("itinerary_days").insert({
            "trip_id": str(trip_id),
            "day_number": day_number,
            "date": date,
            "title": title
        }).execute()
        
        # 检查是否成功添加日程天
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to add itinerary day.")
        
        # 构建响应对象
        day = response.data[0]
        day_response = ItineraryDay(
            id=day['id'],
            day_number=day['day_number'],
            date=day['date'],
            title=day.get('title'),
            items=[]
        )
        
        return day_response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/days/{day_id}", response_model=ItineraryDay)
async def update_itinerary_day(day_id: uuid.UUID, title: Optional[str] = None, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """更新日程天信息
    
    Args:
        day_id: 日程天ID
        title: 标题（可选）
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（必需，依赖注入）
        
    Returns:
        ItineraryDay: 更新后的日程天信息
    """
    try:
        # 验证用户是否有编辑权限（需要先查询day所属的行程）
        day_res = db.table("itinerary_days").select("trip_id").eq("id", str(day_id)).single().execute()
        if not day_res.data:
            raise HTTPException(status_code=404, detail="Itinerary day not found.")
        
        trip_id = day_res.data['trip_id']
        _verify_user_has_access_to_trip(db, user_id, trip_id, "editor")
        
        # 更新日程天
        update_data = {}
        if title is not None:
            update_data["title"] = title
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided.")
        
        response = db.table("itinerary_days").update(update_data).eq("id", str(day_id)).execute()
        
        # 检查是否成功更新日程天
        if not response.data:
            raise HTTPException(status_code=404, detail="Itinerary day not found.")
        
        # 获取更新后的日程天信息
        day = response.data[0]
        
        # 查询相关的项目信息
        items_res = db.table("itinerary_items").select("*").eq("day_id", str(day_id)).execute()
        items = []
        if items_res.data:
            for item in items_res.data:
                items.append(ItineraryItem(
                    id=item['id'],
                    time=item.get('time'),
                    type=item.get('type', 'custom'),
                    name=item['name'],
                    notes=item.get('notes')
                ))
        
        # 构建响应对象
        day_response = ItineraryDay(
            id=day['id'],
            day_number=day['day_number'],
            date=day['date'],
            title=day.get('title'),
            items=items
        )
        
        return day_response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/days/{day_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_itinerary_day(day_id: uuid.UUID, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """删除日程天
    
    Args:
        day_id: 要删除的日程天ID
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（必需，依赖注入）
    """
    try:
        # 验证用户是否有编辑权限（需要先查询day所属的行程）
        day_res = db.table("itinerary_days").select("trip_id").eq("id", str(day_id)).single().execute()
        if not day_res.data:
            raise HTTPException(status_code=404, detail="Itinerary day not found.")
        
        trip_id = day_res.data['trip_id']
        _verify_user_has_access_to_trip(db, user_id, trip_id, "editor")
        
        # 删除日程天
        response = db.table("itinerary_days").delete().eq("id", str(day_id)).execute()
        
        # 检查是否成功删除日程天
        if not response.data:
            raise HTTPException(status_code=404, detail="Itinerary day not found.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 日程项目管理接口 ---

@router.get("/days/{day_id}/items", response_model=List[ItineraryItem])
async def get_itinerary_items(day_id: uuid.UUID, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """获取日程天的所有项目
    
    Args:
        day_id: 日程天ID
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（必需，依赖注入）
        
    Returns:
        List[ItineraryItem]: 日程项目列表
    """
    try:
        # 验证用户是否有访问权限（需要先查询day所属的行程）
        day_res = db.table("itinerary_days").select("trip_id").eq("id", str(day_id)).single().execute()
        if not day_res.data:
            raise HTTPException(status_code=404, detail="Itinerary day not found.")
        
        trip_id = day_res.data['trip_id']
        _verify_user_has_access_to_trip(db, user_id, trip_id)
        
        # 查询日程项目信息
        response = db.table("itinerary_items").select("*").eq("day_id", str(day_id)).order("sort_order").execute()
        
        # 处理日程项目信息
        items = []
        for item in response.data:
            items.append(ItineraryItem(
                id=item['id'],
                time=item.get('time'),
                type=item.get('type', 'custom'),
                name=item['name'],
                notes=item.get('notes')
            ))
        
        return items
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/days/{day_id}/items", response_model=ItineraryItem, status_code=status.HTTP_201_CREATED)
async def add_itinerary_item(day_id: uuid.UUID, name: str, time: Optional[str] = None, type: str = "custom", notes: Optional[str] = None, sort_order: int = 0, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """添加新的日程项目
    
    Args:
        day_id: 日程天ID
        name: 项目名称
        time: 时间（可选）
        type: 类型（可选，默认为custom）
        notes: 备注（可选）
        sort_order: 排序顺序（可选，默认为0）
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（必需，依赖注入）
        
    Returns:
        ItineraryItem: 添加的日程项目信息
    """
    try:
        # 验证用户是否有编辑权限（需要先查询day所属的行程）
        day_res = db.table("itinerary_days").select("trip_id").eq("id", str(day_id)).single().execute()
        if not day_res.data:
            raise HTTPException(status_code=404, detail="Itinerary day not found.")
        
        trip_id = day_res.data['trip_id']
        _verify_user_has_access_to_trip(db, user_id, trip_id, "editor")
        
        # 添加日程项目
        response = db.table("itinerary_items").insert({
            "day_id": str(day_id),
            "name": name,
            "time": time,
            "type": type,
            "notes": notes,
            "sort_order": sort_order
        }).execute()
        
        # 检查是否成功添加日程项目
        if not response.data:
            raise HTTPException(status_code=400, detail="Failed to add itinerary item.")
        
        # 构建响应对象
        item = response.data[0]
        item_response = ItineraryItem(
            id=item['id'],
            time=item.get('time'),
            type=item.get('type', 'custom'),
            name=item['name'],
            notes=item.get('notes')
        )
        
        return item_response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/items/{item_id}", response_model=ItineraryItem)
async def update_itinerary_item(item_id: uuid.UUID, name: Optional[str] = None, time: Optional[str] = None, type: Optional[str] = None, notes: Optional[str] = None, sort_order: Optional[int] = None, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """更新日程项目
    
    Args:
        item_id: 日程项目ID
        name: 项目名称（可选）
        time: 时间（可选）
        type: 类型（可选）
        notes: 备注（可选）
        sort_order: 排序顺序（可选）
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（必需，依赖注入）
        
    Returns:
        ItineraryItem: 更新后的日程项目信息
    """
    try:
        # 验证用户是否有编辑权限（需要先查询item所属的行程）
        item_res = db.table("itinerary_items").select("itinerary_days(trip_id)").eq("id", str(item_id)).single().execute()
        if not item_res.data or not item_res.data.get('itinerary_days'):
            raise HTTPException(status_code=404, detail="Itinerary item not found.")
        
        trip_id = item_res.data['itinerary_days']['trip_id']
        _verify_user_has_access_to_trip(db, user_id, trip_id, "editor")
        
        # 获取请求中非空的更新数据
        update_data = {}
        if name is not None:
            update_data["name"] = name
        if time is not None:
            update_data["time"] = time
        if type is not None:
            update_data["type"] = type
        if notes is not None:
            update_data["notes"] = notes
        if sort_order is not None:
            update_data["sort_order"] = sort_order
        
        # 检查是否有更新数据
        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided.")
        
        # 更新日程项目
        response = db.table("itinerary_items").update(update_data).eq("id", str(item_id)).execute()
        
        # 检查是否成功更新日程项目
        if not response.data:
            raise HTTPException(status_code=404, detail="Itinerary item not found.")
        
        # 构建响应对象
        item = response.data[0]
        item_response = ItineraryItem(
            id=item['id'],
            time=item.get('time'),
            type=item.get('type', 'custom'),
            name=item['name'],
            notes=item.get('notes')
        )
        
        return item_response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_itinerary_item(item_id: uuid.UUID, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """删除日程项目
    
    Args:
        item_id: 要删除的日程项目ID
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（必需，依赖注入）
    """
    try:
        # 验证用户是否有编辑权限（需要先查询item所属的行程）
        item_res = db.table("itinerary_items").select("itinerary_days(trip_id)").eq("id", str(item_id)).single().execute()
        if not item_res.data or not item_res.data.get('itinerary_days'):
            raise HTTPException(status_code=404, detail="Itinerary item not found.")
        
        trip_id = item_res.data['itinerary_days']['trip_id']
        _verify_user_has_access_to_trip(db, user_id, trip_id, "editor")
        
        # 删除日程项目
        response = db.table("itinerary_items").delete().eq("id", str(item_id)).execute()
        
        # 检查是否成功删除日程项目
        if not response.data:
            raise HTTPException(status_code=404, detail="Itinerary item not found.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))