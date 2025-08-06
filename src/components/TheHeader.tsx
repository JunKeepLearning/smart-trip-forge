// 导入 React 库和 useState 钩子，用于组件状态管理
import React, { useState } from 'react';
// 导入 Link 组件，用于在应用内进行路由导航
import { Link } from 'react-router-dom';
// 导入自定义的 Button 组件
import { Button } from '@/components/ui/button';
// 从 lucide-react 库导入图标，用于界面元素
import { Compass, Map, ClipboardList, Menu, X, User, LogOut, Settings } from 'lucide-react';
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

// 定义 TheHeader 组件
const TheHeader = () => {
  // 定义状态 isMobileMenuOpen，用于控制移动端菜单的显示和隐藏
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // 从认证上下文中获取当前用户和登出函数
  const { user, signOut } = useAuth();

  // 定义导航项数组，每个对象包含名称、图标和链接地址
  const navItems = [
    { name: 'Explore', icon: Compass, href: '/explore' },
    { name: 'Plan', icon: Map, href: '/plan' },
    { name: 'Checklist', icon: ClipboardList, href: '/checklist' },
  ];

  // 返回头部组件的 JSX
  return (
    <header className="bg-card border-b border-border">
      {/* 容器，设置最大宽度、内外边距 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Flex 布局，用于排列 Logo、导航和移动端菜单按钮 */}
        <div className="flex justify-between items-center h-16">
          {/* Logo，链接到首页 */}
          <Link to="/" className="text-xl font-bold text-primary">
            travelplan
          </Link>

          {/* 桌面端导航 */}
          <nav className="hidden md:flex items-center space-x-8">
            {/* 遍历导航项，生成导航链接 */}
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
            {/* 根据用户登录状态显示不同内容 */}
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
          </nav>

          {/* 移动端菜单按钮 */}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-primary"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {/* 根据菜单展开状态显示不同图标 */}
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* 移动端导航菜单 */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col space-y-4">
              {/* 遍历导航项，生成移动端导航链接 */}
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors duration-200"
                  onClick={() => setIsMobileMenuOpen(false)} // 点击后关闭菜单
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              ))}
              {/* 根据用户登录状态显示不同内容 */}
              {user ? (
                // 如果用户已登录，显示用户信息和登出按钮
                <div className="border-t pt-4 space-y-4">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-primary"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    <span>{user.user_metadata.display_name || user.email}</span>
                  </Link>
                  <Button variant="outline" onClick={() => { signOut(); setIsMobileMenuOpen(false); }} className="w-full">
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                  </Button>
                </div>
              ) : (
                // 如果用户未登录，显示登录按钮
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground w-fit">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

// 导出 TheHeader 组件
export default TheHeader;