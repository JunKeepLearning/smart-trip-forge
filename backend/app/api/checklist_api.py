import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
from app.core.client import get_supabase_client
from app.core.auth import require_user, optional_user
from supabase import Client

# 创建API路由实例，用于定义清单相关的API端点
router = APIRouter()

# --- 所有权验证辅助函数 ---

def _verify_user_owns_checklist(db: Client, user_id: str, checklist_id: str):
    """验证用户是否拥有指定的清单。如果不拥有，则抛出HTTP 404异常。
    
    Args:
        db: Supabase数据库客户端实例
        user_id: 用户ID
        checklist_id: 清单ID
    """
    # 查询数据库中用户ID和清单ID都匹配的记录
    res = db.table("checklists").select("id").eq("id", checklist_id).eq("user_id", user_id).execute()
    # 如果没有找到匹配的记录，则抛出404异常
    if not res.data:
        raise HTTPException(status_code=404, detail="Checklist not found or access denied.")

def _verify_user_owns_category(db: Client, user_id: str, category_id: str):
    """验证用户是否拥有指定的分类。如果不拥有，则抛出HTTP 404异常。
    
    Args:
        db: Supabase数据库客户端实例
        user_id: 用户ID
        category_id: 分类ID
        
    Returns:
        dict: 数据库查询结果数据
    """
    # 查询分类及其关联的清单用户ID
    res = db.table("checklist_categories").select("id, checklists(user_id)").eq("id", category_id).single().execute()
    # 验证分类存在且用户拥有该分类
    if not res.data or res.data['checklists']['user_id'] != user_id:
        raise HTTPException(status_code=404, detail="Category not found or access denied.")
    return res.data

def _verify_user_owns_item(db: Client, user_id: str, item_id: str):
    """验证用户是否拥有指定的项目。如果不拥有，则抛出HTTP 404异常。
    
    Args:
        db: Supabase数据库客户端实例
        user_id: 用户ID
        item_id: 项目ID
    """
    # 查询项目及其关联的分类和清单用户ID
    res = db.table("checklist_items").select("id, checklist_categories(checklists(user_id))").eq("id", item_id).single().execute()
    # 验证项目存在且用户拥有该项目
    if not res.data or res.data['checklist_categories']['checklists']['user_id'] != user_id:
        raise HTTPException(status_code=404, detail="Item not found or access denied.")

# --- Pydantic数据模型 ---

class ChecklistItem(BaseModel):
    """清单项目数据模型"""
    id: uuid.UUID  # 项目唯一标识符
    name: str      # 项目名称
    quantity: int  # 项目数量
    checked: bool  # 是否已完成
    notes: Optional[str] = None  # 项目备注（可选）
    category_id: uuid.UUID       # 所属分类ID

class ChecklistCategory(BaseModel):
    """清单分类数据模型"""
    id: uuid.UUID              # 分类唯一标识符
    name: str                  # 分类名称
    icon: Optional[str] = None # 分类图标（可选）
    items: List[ChecklistItem] = Field(default_factory=list)  # 分类下的项目列表

class ChecklistCreateRequest(BaseModel):
    """创建清单请求数据模型"""
    name: str                  # 清单名称
    tags: List[str] = Field(default_factory=list)  # 清单标签列表

class ChecklistResponse(BaseModel):
    """清单响应数据模型"""
    id: uuid.UUID              # 清单唯一标识符
    name: str                  # 清单名称
    tags: List[str] = Field(default_factory=list)  # 清单标签列表
    is_template: bool = False  # 是否为模板
    categories: List[ChecklistCategory] = Field(default_factory=list)  # 清单分类列表

class ChecklistInfo(BaseModel):
    """清单信息数据模型"""
    id: uuid.UUID              # 清单唯一标识符
    name: str                  # 清单名称
    tags: List[str]            # 清单标签列表
    is_template: bool = False  # 是否为模板

# 精细化操作的数据模型
class CategoryCreate(BaseModel):
    """创建分类请求数据模型"""
    name: str                  # 分类名称
    icon: Optional[str] = None # 分类图标（可选）

class CategoryUpdate(BaseModel):
    """更新分类请求数据模型"""
    name: Optional[str] = None # 分类名称（可选）
    icon: Optional[str] = None # 分类图标（可选）

class ItemCreate(BaseModel):
    """创建项目请求数据模型"""
    name: str     # 项目名称
    quantity: int = 1  # 项目数量，默认为1

class ItemUpdate(BaseModel):
    """更新项目请求数据模型"""
    name: Optional[str] = None   # 项目名称（可选）
    quantity: Optional[int] = None  # 项目数量（可选）
    checked: Optional[bool] = None  # 是否已完成（可选）
    notes: Optional[str] = None     # 项目备注（可选）


# --- 主要清单端点 ---

@router.get("/", response_model=List[ChecklistResponse])
def get_all_checklists(db: Client = Depends(get_supabase_client), user_id: Optional[str] = Depends(optional_user)):
    """获取所有清单列表
    
    Args:
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（可选，依赖注入）
        
    Returns:
        List[ChecklistResponse]: 清单响应对象列表
    """
    try:
        # 构建数据库查询，包含清单、分类和项目信息
        query = db.table("checklists").select("*, checklist_categories(*, checklist_items(*))")
        if user_id:
            # 已登录用户可以看到自己的清单和所有模板
            query = query.or_(f"user_id.eq.{user_id},is_template.eq.true")
        else:
            # 匿名用户只能看到模板
            query = query.eq("is_template", True)
        
        # 按创建时间倒序排列并执行查询
        response = query.order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        # 捕获并抛出数据库异常
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=ChecklistInfo, status_code=status.HTTP_201_CREATED)
def create_checklist(req: ChecklistCreateRequest, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """创建新的清单
    
    Args:
        req: 清单创建请求对象
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（必需，依赖注入）
        
    Returns:
        ChecklistInfo: 创建的清单信息
    """
    try:
        # 向数据库插入新的清单记录
        response = db.table("checklists").insert({
            "name": req.name,
            "tags": req.tags,
            "user_id": user_id
        }).execute()
        
        # 检查是否成功创建清单
        if not response.data:
            raise HTTPException(status_code=403, detail="Failed to create checklist, possibly due to RLS policy.")
        return response.data[0]
    except Exception as e:
        # 捕获并抛出数据库异常
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{checklist_id}", response_model=ChecklistResponse)
def get_checklist_details(checklist_id: uuid.UUID, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """获取清单详细信息
    
    Args:
        checklist_id: 清单ID
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（必需，依赖注入）
        
    Returns:
        ChecklistResponse: 清单响应对象
    """
    try:
        # 查询指定ID的清单及其关联的分类和项目信息
        response = db.table("checklists").select("*, checklist_categories(*, checklist_items(*))").eq("id", str(checklist_id)).eq("user_id", user_id).single().execute()
        
        # 检查是否找到清单
        if not response.data:
            raise HTTPException(status_code=404, detail="Checklist not found or access denied")
        return response.data
    except Exception as e:
        # 捕获并抛出数据库异常
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{checklist_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_checklist(checklist_id: uuid.UUID, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """删除指定的清单
    
    Args:
        checklist_id: 要删除的清单ID
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（必需，依赖注入）
    """
    # 验证用户拥有该清单
    _verify_user_owns_checklist(db, user_id, str(checklist_id))
    try:
        # 从数据库中删除清单记录
        db.table("checklists").delete().eq("id", str(checklist_id)).execute()
    except Exception as e:
        # 捕获并抛出删除异常
        raise HTTPException(status_code=500, detail=f"Failed to delete checklist: {str(e)}")

# --- 精细化分类端点 ---

@router.post("/{checklist_id}/categories", response_model=ChecklistCategory, status_code=status.HTTP_201_CREATED)
def create_category_for_checklist(checklist_id: uuid.UUID, req: CategoryCreate, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """为指定清单创建新的分类
    
    Args:
        checklist_id: 清单ID
        req: 分类创建请求对象
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（必需，依赖注入）
        
    Returns:
        ChecklistCategory: 创建的分类对象
    """
    # RLS策略在checklist_categories表上处理所有权验证
    try:
        # 向数据库插入新的分类记录
        res = db.table("checklist_categories").insert({
            "checklist_id": str(checklist_id),
            "name": req.name,
            "icon": req.icon,
            # 注意：此表不直接存储user_id，所有权从清单派生
        }).execute()
        
        # 检查是否成功创建分类
        if not res.data:
            # 这可能发生在RLS失败时（例如，清单ID不存在或用户不拥有它）
            raise HTTPException(status_code=404, detail="Failed to create category. Checklist not found or access denied.")
        
        # 初始化新分类的项目列表并返回
        new_category = res.data[0]
        new_category['items'] = []
        return new_category
    except Exception as e:
        # 捕获潜在的数据库错误，例如唯一性约束冲突
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/categories/{category_id}", response_model=ChecklistCategory)
def update_category(category_id: uuid.UUID, req: CategoryUpdate, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """更新指定的分类
    
    Args:
        category_id: 要更新的分类ID
        req: 分类更新请求对象
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（必需，依赖注入）
        
    Returns:
        ChecklistCategory: 更新后的分类对象
    """
    # 验证用户拥有该分类
    _verify_user_owns_category(db, user_id, str(category_id))
    try:
        # 获取请求中非空的更新数据
        update_data = req.model_dump(exclude_unset=True)
        # 检查是否有更新数据
        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided.")
        # 更新数据库中的分类记录
        res = db.table("checklist_categories").update(update_data).eq("id", str(category_id)).execute()
        
        # 检查是否成功更新分类
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to update category.")
        return res.data[0]
    except Exception as e:
        # 捕获并抛出数据库异常
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: uuid.UUID, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """删除指定的分类
    
    Args:
        category_id: 要删除的分类ID
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（必需，依赖注入）
    """
    # 验证用户拥有该分类
    _verify_user_owns_category(db, user_id, str(category_id))
    try:
        # 从数据库中删除分类记录
        db.table("checklist_categories").delete().eq("id", str(category_id)).execute()
    except Exception as e:
        # 捕获并抛出删除异常
        raise HTTPException(status_code=500, detail=f"Failed to delete category: {str(e)}")

# --- 精细化项目端点 ---

@router.post("/categories/{category_id}/items", response_model=ChecklistItem, status_code=status.HTTP_201_CREATED)
def create_item_for_category(category_id: uuid.UUID, req: ItemCreate, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """为指定分类创建新的项目
    
    Args:
        category_id: 分类ID
        req: 项目创建请求对象
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（必需，依赖注入）
        
    Returns:
        ChecklistItem: 创建的项目对象
    """
    # 验证用户拥有该分类
    _verify_user_owns_category(db, user_id, str(category_id))
    try:
        # 向数据库插入新的项目记录
        res = db.table("checklist_items").insert({
            "category_id": str(category_id),
            "name": req.name,
            "quantity": req.quantity
        }).execute()
        
        # 检查是否成功创建项目
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to create item.")
        return res.data[0]
    except Exception as e:
        # 捕获并抛出数据库异常
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/items/{item_id}", response_model=ChecklistItem)
def update_item(item_id: uuid.UUID, req: ItemUpdate, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """更新指定的项目
    
    Args:
        item_id: 要更新的项目ID
        req: 项目更新请求对象
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（必需，依赖注入）
        
    Returns:
        ChecklistItem: 更新后的项目对象
    """
    # 验证用户拥有该项目
    _verify_user_owns_item(db, user_id, str(item_id))
    try:
        # 获取请求中非空的更新数据
        update_data = req.model_dump(exclude_unset=True)
        # 检查是否有更新数据
        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided.")
        # 更新数据库中的项目记录
        res = db.table("checklist_items").update(update_data).eq("id", str(item_id)).execute()
        
        # 检查是否成功更新项目
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to update item.")
        return res.data[0]
    except Exception as e:
        # 捕获并抛出数据库异常
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: uuid.UUID, db: Client = Depends(get_supabase_client), user_id: str = Depends(require_user)):
    """删除指定的项目
    
    Args:
        item_id: 要删除的项目ID
        db: Supabase数据库客户端实例（依赖注入）
        user_id: 用户ID（必需，依赖注入）
    """
    # 验证用户拥有该项目
    _verify_user_owns_item(db, user_id, str(item_id))
    try:
        # 从数据库中删除项目记录
        db.table("checklist_items").delete().eq("id", str(item_id)).execute()
    except Exception as e:
        # 捕获并抛出删除异常
        raise HTTPException(status_code=500, detail=f"Failed to delete item: {str(e)}")