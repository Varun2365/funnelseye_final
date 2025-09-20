import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HierarchyRequests from './HierarchyRequests';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  CreditCard, 
  BarChart3, 
  FileText,
  LogOut,
  Menu,
  X,
  Shield,
  BookOpen,
  Package,
  MessageCircle,
  TrendingUp,
  Lock,
  DollarSign,
  HelpCircle,
  Bot,
  Brain,
  Calendar,
  Mail,
  Target,
  Zap,
  Database,
  Server,
  UserCheck,
  AlertTriangle,
  Activity,
  PieChart,
  Globe,
  Layers,
  Cog,
  Monitor
} from 'lucide-react';
import { cn } from '../lib/utils';
import ThemeSwitcher from './ThemeSwitcher';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'User Management', href: '/users', icon: Users },
    { name: 'Subscription Plans', href: '/subscription-plans', icon: Package },
    { name: 'Financial & MLM', href: '/financial', icon: DollarSign },
    { name: 'Downline Management', href: '/downline-management', icon: Layers },
    { name: 'Hierarchy Requests', href: '/hierarchy-requests', icon: UserCheck },
    { name: 'Platform Configuration', href: '/platform-config', icon: Cog },
    // { name: 'Debug Financial', href: '/debug-financial', icon: Monitor },
    { name: 'Content Management', href: '/courses', icon: BookOpen },
    // { name: 'Support Center', href: '/support', icon: HelpCircle },
    { name: 'Analytics & Reports', href: '/analytics', icon: BarChart3 },
    { name: 'Messaging', href: '/messaging', icon: MessageCircle },
    { name: 'Admin Staff', href: '/admin-staff', icon: UserCheck },
    // { name: 'Security & Compliance', href: '/security', icon: Shield }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-background border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-screen">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary rounded-lg">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">Admin Panel</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start nav-item",
                    isActive && "bg-secondary text-secondary-foreground"
                  )}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Button>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-muted rounded-full">
                <Shield className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {admin?.firstName} {admin?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {admin?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="bg-card border-b h-16 flex items-center justify-between px-6 sticky top-0 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Welcome back, {admin?.firstName}
            </div>
            <ThemeSwitcher variant="simple" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
