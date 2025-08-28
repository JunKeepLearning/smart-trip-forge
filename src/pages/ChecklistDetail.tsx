/**
 * @file ChecklistDetail.tsx
 * @description 该文件定义了清单详情页组件 (ChecklistDetail)。
 * 用户可以在此页面查看、管理一个特定清单的所有项目。
 * 功能包括：
 * - 显示清单名称、标签和总体进度。
 * - 按类别分组显示所有清单项目。
 * - 勾选/取消勾选清单项目，并实时更新状态。
 * - 在每个类别下添加新的清单项目。
 * - 添加新的清单类别。
 * - 双击项目可打开编辑对话框，以修改或删除项目。
 * - 提供清单设置入口，可删除整个清单。
 * - 页面加载状态和清单未找到时的提示。
 */

// 导入React核心钩子
import { useState, useEffect, useMemo, useRef } from "react";
// 导入路由相关的钩子，用于获取URL参数和页面导航
import { useParams, useNavigate } from "react-router-dom";
// 导入清单上下文，用于获取和操作清单数据
import { useChecklists, Checklist, ChecklistItem } from "@/contexts/ChecklistsContext";
// 导入自定义的UI组件
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
// 导入图标库
import { ArrowLeft, Settings, Share2, Package, Shirt, Star, Smartphone, Plus, Car, Utensils, Gift, Camera, Loader2 } from "lucide-react";
// 导入自定义的对话框和设置组件
import ChecklistSettings from "@/components/ChecklistSettings";
import AddCategoryDialog, { CategoryData } from "@/components/AddCategoryDialog";
import { EditItemDialog } from "@/components/EditItemDialog";

// 定义一个图标名称到React组件的映射，用于动态显示类别图标
const iconMap: { [key: string]: React.ComponentType<any> } = {
  Shirt, Star, Smartphone, Car, Utensils, Gift, Camera, Package,
};

/**
 * 根据图标名称返回对应的Icon组件。如果找不到，则返回默认的Package图标。
 * @param iconName - 图标名称字符串
 * @returns React图标组件
 */
const getIconComponent = (iconName: string) => iconMap[iconName] || Package;

/**
 * 清单详情页组件
 */
const ChecklistDetail = () => {
  // 从URL中获取清单ID
  const { checklistId } = useParams<{ checklistId: string }>();
  // 获取导航函数
  const navigate = useNavigate();
  // 获取显示toast通知的函数
  const { toast } = useToast();
  // 从清单上下文中获取状态和操作函数
  const {
    checklists,
    getChecklistById,
    updateChecklist,
    deleteChecklist,
    addCategory,
    addItem,
    updateItem,
    deleteItem,
    isLoading: isContextLoading,
  } = useChecklists();

  // 使用useMemo从清单列表中查找当前ID对应的清单对象，以优化性能
  // 这是当前页面显示的清单数据的唯一真实来源
  const checklist = useMemo(() => checklists.find(c => c.id === checklistId), [checklists, checklistId]);

  // --- 组件状态管理 ---
  // 初始加载状态，用于首次进入页面获取完整数据
  const [isInitialLoading, setInitialLoading] = useState(true);
  // 控制手风琴（类别列表）的展开状态
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  // 控制设置侧边栏的显示状态
  const [isSettingsOpen, setSettingsOpen] = useState(false);
  // 控制添加类别对话框的显示状态
  const [isAddCategoryOpen, setAddCategoryOpen] = useState(false);
  
  // 新增项目的输入框内容
  const [newItemName, setNewItemName] = useState('');
  // 标记是否正在添加新项目，用于禁用按钮和显示加载动画
  const [isAddingItem, setIsAddingItem] = useState(false);
  // 对新增项目输入框的引用，用于在添加后重新聚焦
  const newItemInputRef = useRef<HTMLInputElement>(null);

  // 控制编辑项目对话框的显示状态
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  // 当前被选中用于编辑或删除的项目
  const [selectedItem, setSelectedItem] = useState<{ item: ChecklistItem; categoryId: string } | null>(null);
  
  // 跟踪哪些项目正在通过API进行更新，用于显示加载状态
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  // Effect钩子：在组件加载或checklistId变化时运行
  useEffect(() => {
    if (!checklistId) {
      setInitialLoading(false);
      return;
    }

    // 首次加载时获取完整的清单详情，因为上下文中的数据可能只是摘要
    getChecklistById(checklistId).then((fullChecklist) => {
      // 如果获取到完整数据并且包含类别，则默认展开所有类别
      if (fullChecklist && fullChecklist.categories) {
        setOpenCategories(fullChecklist.categories.map(c => c.id));
      }
      // 数据加载完成，结束初始加载状态
      setInitialLoading(false);
    });
  }, [checklistId, getChecklistById]);

  // useMemo钩子：计算清单的总体进度
  const overallProgress = useMemo(() => {
    if (!checklist || !checklist.categories) return { checked: 0, total: 0 };
    let checked = 0;
    let total = 0;
    checklist.categories.forEach(cat => {
      total += cat.items.length;
      checked += cat.items.filter(item => item.checked).length;
    });
    return { checked, total };
  }, [checklist]);

  /**
   * 处理清单项目的勾选/取消勾选
   * @param itemId - 项目ID
   * @param checked - 是否勾选
   */
  const handleCheckItem = async (itemId: string, checked: boolean) => {
    setUpdatingItems(prev => new Set(prev).add(itemId)); // 开始更新，加入updating集合
    try {
      await updateItem(itemId, { checked });
    } finally {
      setUpdatingItems(prev => { // 结束更新，移出updating集合
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  /**
   * 处理添加新项目
   * @param categoryId - 类别ID
   */
  const handleAddItem = async (categoryId: string) => {
    const trimmedName = newItemName.trim();
    if (!trimmedName || isAddingItem) return; // 防止重复提交或添加空内容

    setIsAddingItem(true);
    try {
      await addItem(categoryId, { name: trimmedName });
      setNewItemName(''); // 清空输入框
      newItemInputRef.current?.focus(); // 重新聚焦输入框，方便连续添加
    } finally {
      setIsAddingItem(false);
    }
  };

  /**
   * 处理添加新类别
   * @param categoryData - 包含类别名称和图标的数据
   */
  const handleAddCategory = async (categoryData: CategoryData) => {
    if (!checklistId) return;
    await addCategory(checklistId, categoryData);
    // 添加成功后，上下文会自动更新，组件会随之重新渲染
  };

  /**
   * 打开编辑项目对话框
   * @param item - 要编辑的项目对象
   * @param categoryId - 该项目所属的类别ID
   */
  const handleOpenEditDialog = (item: ChecklistItem, categoryId: string) => {
    setSelectedItem({ item, categoryId });
    setEditDialogOpen(true);
  };

  /**
   * 保存对项目的修改
   * @param itemData - 更新后的项目数据
   */
  const handleSaveItem = async (itemData: Partial<Omit<ChecklistItem, 'id'>>) => {
    if (!selectedItem) return;
    await updateItem(selectedItem.item.id, itemData);
    toast({ title: "Item Updated", description: `"${itemData.name || selectedItem.item.name}" has been updated.` });
  };

  /**
   * 删除选中的项目
   */
  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    await deleteItem(selectedItem.categoryId, selectedItem.item.id);
    toast({ title: "Item Deleted", description: `"${selectedItem.item.name}" has been deleted.`, variant: "destructive" });
  };

  /**
   * 保存对清单设置的修改
   * @param settingsData - 更新后的设置数据，包含 name 和 tags
   */
  const handleSaveSettings = async (settingsData: { name: string; tags: string[] }) => {
    if (!checklist) return;
    await updateChecklist(checklist.id, settingsData);
  };

  /**
   * 删除整个清单
   */
  const handleDeleteChecklist = async () => {
    if (!checklist) return;
    const success = await deleteChecklist(checklist.id);
    if (success) {
      toast({ title: "Checklist Deleted" });
      navigate('/checklist'); // 删除成功后返回清单列表页
    }
  };

  // --- 渲染逻辑 ---

  // 如果正在进行初始加载或上下文数据加载，则显示加载动画
  if (isInitialLoading || isContextLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // 如果清单未找到，则显示提示信息
  if (!checklist) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold">Checklist not found</h2>
        <Button onClick={() => navigate('/checklist')} className="mt-4">Back to Checklists</Button>
      </div>
    );
  }

  // 主体渲染
  return (
    <>
      <div className="flex flex-col min-h-screen bg-background">
        <main className="flex-grow container mx-auto px-4 py-8">
          {/* 页面头部：返回按钮、标题、标签和操作按钮 */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate('/checklist')}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
              <h1 className="text-3xl font-bold text-foreground">{checklist.name}</h1>
              <div className="flex items-center gap-2 mt-2">{checklist.tags.map(tag => <Badge key={tag}>{tag}</Badge>)}</div>
            </div>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Button variant="outline" size="icon" onClick={() => {}}><Share2 className="h-4 w-4"/></Button>
              <Button variant="outline" size="icon" onClick={() => setSettingsOpen(true)}><Settings className="h-4 w-4"/></Button>
            </div>
          </div>

          {/* 总体进度条 */}
          <div className="my-4">
            <div className="flex justify-between items-baseline mb-1">
              <span className="text-sm font-medium text-muted-foreground">Overall Progress</span>
              <span className="text-sm font-semibold text-muted-foreground">{overallProgress.checked}/{overallProgress.total}</span>
            </div>
            <Progress value={overallProgress.total > 0 ? (overallProgress.checked / overallProgress.total) * 100 : 0} className="h-2" />
          </div>

          <Separator className="my-4"/>

          {/* 类别和项目列表 (手风琴) */}
          <Accordion type="multiple" className="w-full" value={openCategories} onValueChange={setOpenCategories}>
            {checklist.categories?.map(category => {
              const IconComponent = getIconComponent(category.icon);
              const categoryChecked = category.items.filter(i => i.checked).length;
              const categoryTotal = category.items.length;
              return (
                <AccordionItem key={category.id} value={category.id}>
                  <AccordionTrigger>
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5"/>
                        <span className="text-lg font-semibold">{category.name}</span>
                      </div>
                      <Badge variant="secondary" className="mr-4">{categoryChecked} / {categoryTotal}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="pl-8 space-y-3">
                      {/* 渲染类别下的所有项目 */}
                      {category.items.map(item => (
                        <div key={item.id} className="flex items-center space-x-3">
                          <Checkbox
                            id={`${category.id}-${item.id}`}
                            checked={item.checked}
                            onCheckedChange={(checked) => handleCheckItem(item.id, !!checked)}
                            className="w-5 h-5"
                            disabled={updatingItems.has(item.id)} // 如果项目正在更新，则禁用复选框
                          />
                          <div className="flex-1 flex items-center gap-2" onDoubleClick={() => handleOpenEditDialog(item, category.id)}>
                            <label
                              htmlFor={`${category.id}-${item.id}`}
                              className={`font-medium cursor-pointer ${item.checked ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                            >
                              {item.name}
                            </label>
                            {/* 如果项目正在更新，显示加载动画 */}
                            {updatingItems.has(item.id) && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                          </div>
                        </div>
                      ))}
                      {/* 如果类别下没有项目，显示提示 */}
                      {category.items.length === 0 && <p className="text-muted-foreground text-sm">No items in this category.</p>}
                      
                      {/* 添加新项目的表单 */}
                      <form
                        className="flex items-center space-x-2 pt-4"
                        onSubmit={(e) => { e.preventDefault(); handleAddItem(category.id); }}
                      >
                        <Input
                          ref={newItemInputRef}
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          placeholder="Add a new item..."
                          className="flex-grow"
                          disabled={isAddingItem}
                        />
                        <Button type="submit" size="icon" disabled={isAddingItem}>
                          {isAddingItem ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        </Button>
                      </form>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          {/* 添加新类别的按钮 */}
          <Button variant="outline" className="w-full border-dashed mt-4 py-6" onClick={() => setAddCategoryOpen(true)}>
            <Plus className="h-5 w-5 mr-2" /> Add New Category
          </Button>
        </main>
      </div>

      {/* 弹窗/侧边栏组件 */}
      <ChecklistSettings checklist={checklist} open={isSettingsOpen} onOpenChange={setSettingsOpen} onSave={handleSaveSettings} onDelete={handleDeleteChecklist} />
      {checklist && <AddCategoryDialog open={isAddCategoryOpen} onOpenChange={setAddCategoryOpen} onAddCategory={handleAddCategory} existingCategories={checklist.categories?.map(c => c.name) || []} />}
      <EditItemDialog isOpen={isEditDialogOpen} onOpenChange={setEditDialogOpen} item={selectedItem?.item || null} onSave={handleSaveItem} onDelete={handleDeleteItem} />
    </>
  );
};

export default ChecklistDetail;
