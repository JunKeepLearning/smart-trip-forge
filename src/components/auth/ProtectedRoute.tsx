import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuthStore();
  const { showLoading, hideLoading } = useUIStore();
  const location = useLocation();

  // 显示加载状态
  React.useEffect(() => {
    if (loading) {
      showLoading(' Authenticating...');
    } else {
      hideLoading();
    }

    // 清理函数
    return () => {
      hideLoading();
    };
  }, [loading, showLoading, hideLoading]);

  // 如果仍在加载，显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  // 如果用户未认证，重定向到登录页，并保存用户尝试访问的路径
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 用户已认证，渲染子组件
  return <>{children}</>;
};

export default ProtectedRoute;