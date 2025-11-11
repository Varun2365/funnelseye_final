import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HierarchyRequests from './HierarchyRequests';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
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
  Upload,
  PlusCircle,
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
  Monitor,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [courseCategory, setCourseCategory] = useState('customer'); // 'coach' or 'customer'
  const [courseCreationOpen, setCourseCreationOpen] = useState(false); // Track if Course Creation is expanded
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync course category with URL parameter and auto-expand if on course page
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam === 'coach' || categoryParam === 'customer') {
      setCourseCategory(categoryParam);
    }
    
    // Auto-expand Course Creation if on course creation page
    if (location.pathname.startsWith('/course-creation')) {
      setCourseCreationOpen(true);
    }
  }, [location.search, location.pathname]);

  const navigationGroups = [
    // Group 1: Dashboard, User Management, Hierarchy
    {
      title: 'Core Management',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'User Management', href: '/users', icon: Users },
        { name: 'Hierarchy Requests', href: '/hierarchy-requests', icon: UserCheck },
      ]
    },
    // Group 2: Financial & MLM, Subscription Plans, Analytics & Reports
    {
      title: 'Financial & Analytics',
      items: [
        { name: 'Financial & MLM', href: '/financial-mlm', icon: DollarSign },
        { name: 'Subscription Plans', href: '/subscription-plans', icon: Package },
        { name: 'Analytics & Reports', href: '/analytics', icon: BarChart3 },
      ]
    },
    // Group 3: Content Creation, Uploads
    {
      title: 'Content Management',
      items: [
        { 
          name: 'Course Creation', 
          href: '/course-creation', 
          icon: PlusCircle,
          hasDropdown: true 
        },
        { name: 'Uploads', href: '/uploads', icon: Upload },
      ]
    },
    // Group 4: Messaging, Mail Setup, Admin Staff
    {
      title: 'Communication & Staff',
      items: [
        { name: 'WhatsApp Dashboard', href: '/messaging', icon: MessageCircle },
        { name: 'Mail Setup', href: '/mail-setup', icon: Mail },
        { name: 'Admin Staff', href: '/admin-staff', icon: UserCheck },
      ]
    }
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
          <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
            {navigationGroups.map((group, groupIndex) => (
              <div key={group.title}>
                {/* Group Title */}
                <div className="px-3 mb-3">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {group.title}
                  </h3>
                </div>
                
                {/* Group Items */}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    
                    // Special handling for Course Creation with collapsible submenu
                    if (item.hasDropdown && item.name === 'Course Creation') {
                      const isOnCoursePage = location.pathname.startsWith('/course-creation');
                      return (
                        <Collapsible 
                          key={item.name} 
                          open={courseCreationOpen} 
                          onOpenChange={setCourseCreationOpen}
                        >
                          <CollapsibleTrigger asChild>
                            <Button
                              variant={isOnCoursePage ? "secondary" : "ghost"}
                              className={cn(
                                "w-full justify-between nav-item",
                                isOnCoursePage && "bg-secondary text-secondary-foreground"
                              )}
                            >
                              <div className="flex items-center">
                                <item.icon className="mr-3 h-4 w-4" />
                                {item.name}
                              </div>
                              {courseCreationOpen ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="ml-4 mt-1 space-y-1">
                            <Button
                              variant={isOnCoursePage && courseCategory === 'customer' ? "secondary" : "ghost"}
                              className={cn(
                                "w-full justify-start nav-item text-sm h-8",
                                isOnCoursePage && courseCategory === 'customer' && "bg-secondary text-secondary-foreground"
                              )}
                              onClick={() => {
                                setCourseCategory('customer');
                                navigate('/course-creation?category=customer');
                                setSidebarOpen(false);
                              }}
                            >
                              <BookOpen className="mr-2 h-3 w-3" />
                              Customer Courses
                            </Button>
                            <Button
                              variant={isOnCoursePage && courseCategory === 'coach' ? "secondary" : "ghost"}
                              className={cn(
                                "w-full justify-start nav-item text-sm h-8",
                                isOnCoursePage && courseCategory === 'coach' && "bg-secondary text-secondary-foreground"
                              )}
                              onClick={() => {
                                setCourseCategory('coach');
                                navigate('/course-creation?category=coach');
                                setSidebarOpen(false);
                              }}
                            >
                              <Users className="mr-2 h-3 w-3" />
                              Coach Courses
                            </Button>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    }
                    
                    // Regular navigation items
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
                </div>
                
                {/* Divider (except for last group) */}
                {groupIndex < navigationGroups.length - 1 && (
                  <div className="mt-6 mb-2">
                    <div className="h-px bg-border"></div>
                  </div>
                )}
              </div>
            ))}
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
