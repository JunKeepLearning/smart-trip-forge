import { create } from 'zustand';

// --- Drawer 类型 ---
export type DrawerType = 'destination' | 'route' | 'spot';

// 假设每种类型有不同结构
interface Destination { id: string; name: string }
interface Route { id: string; path: string[] }
interface Spot { id: string; title: string }

// Drawer Item 联合类型
export type DrawerItem = Destination | Route | Spot | null;

// Drawer 状态
interface DrawerState {
  isOpen: boolean;
  item: DrawerItem;
  type: DrawerType | null;
  // 未来可以加动画状态等字段
  isAnimating?: boolean;
}

// 全局加载状态
interface LoadingState {
  isLoading: boolean;
  message?: string;
}

// 通知类型
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

// 通知接口
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

// UI Store 接口
interface UIState {
  drawer: DrawerState;
  loading: LoadingState;
  notifications: Notification[];
  
  openDrawer: (item: DrawerItem, type: DrawerType) => void;
  closeDrawer: () => void;
  toggleDrawer: (item?: DrawerItem, type?: DrawerType) => void;
  
  showLoading: (message?: string) => void;
  hideLoading: () => void;
  
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  drawer: {
    isOpen: false,
    item: null,
    type: null,
    isAnimating: false,
  },
  
  loading: {
    isLoading: false,
    message: undefined,
  },
  
  notifications: [],

  openDrawer: (item, type) => {
    set(state => ({
      drawer: { ...state.drawer, isOpen: true, item, type }
    }));
  },

  closeDrawer: () => {
    set(state => ({
      drawer: { ...state.drawer, isOpen: false, item: null, type: null }
    }));
  },

  toggleDrawer: (item, type) => {
    set(state => {
      const isCurrentlyOpen = state.drawer.isOpen;
      return {
        drawer: {
          ...state.drawer,
          isOpen: !isCurrentlyOpen,
          item: !isCurrentlyOpen ? item ?? state.drawer.item : null,
          type: !isCurrentlyOpen ? type ?? state.drawer.type : null
        }
      };
    });
  },
  
  showLoading: (message?: string) => {
    set(state => ({
      loading: { isLoading: true, message }
    }));
  },
  
  hideLoading: () => {
    set(state => ({
      loading: { isLoading: false, message: undefined }
    }));
  },
  
  addNotification: (notification) => {
    const newNotification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      ...notification
    };
    
    set(state => ({
      notifications: [...state.notifications, newNotification]
    }));
    
    // 自动移除通知（如果设置了持续时间）
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        get().removeNotification(newNotification.id);
      }, notification.duration);
    }
  },
  
  removeNotification: (id) => {
    set(state => ({
      notifications: state.notifications.filter(notification => notification.id !== id)
    }));
  },
  
  clearNotifications: () => {
    set(state => ({
      notifications: []
    }));
  }
}));
