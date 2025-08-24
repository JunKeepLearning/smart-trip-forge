
// 导入 React 库，用于组件开发
import React from 'react';
// 导入 Link 组件，用于在应用内进行路由导航
import { Link, NavLink } from 'react-router-dom';
// 导入自定义的 Button 组件
import { Button } from '@/components/ui/button';
// 从 lucide-react 库导入图标，用于界面元素
import { LogOut, Settings } from 'lucide-react';
// 导入 useAuth 自定义钩子，用于访问认证上下文
import { useAuth } from '@/contexts/AuthContext';
// 导入下拉菜单相关组件
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// 导入头像相关组件
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// 从布局配置中导入导航链接
import { navLinks } from './layout';

// 定义 TheHeader 组件
const TheHeader = () => {
  // 从认证上下文中获取当前用户和登出函数
  const { user, signOut } = useAuth();

  // 返回头部组件的 JSX
  return (
    <header className="fixed top-0 left-0 right-0 bg-card border-b border-border z-40 h-header-height">
      {/* 容器，设置最大宽度、内外边距 */}
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        {/* Flex 布局，用于排列 Logo、导航和用户菜单 */}
        <div className="flex justify-between items-center">
          {/* Logo，链接到首页 */}
          <Link to="/" className="text-xl font-bold text-primary">
            travelplan
          </Link>

          {/* 桌面端导航 (在 md 及以上屏幕尺寸显示) */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* 遍历导航项，生成导航链接 */}
            {navLinks.map((item) => (
              <NavLink
                key={item.label}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center space-x-2 transition-colors duration-200 ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-primary'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* 用户认证相关按钮 */}
          <div className="flex items-center">
            {user ? (
              // 如果用户已登录，显示下拉菜单
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      {/* 显示用户头像，如果不存在则显示用户名的首字母 */}
                      <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata.display_name || user.email} />
                      <AvatarFallback>{user.user_metadata.display_name?.[0].toUpperCase() || user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.user_metadata.display_name || 'My Account'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              // 如果用户未登录，显示登录按钮
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link to="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

// 导出 TheHeader 组件
export default TheHeader;
