'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getUserRole } from '@/lib/roleGuard';
import type { UserRole } from '@/lib/roleGuard';
import {
  LayoutDashboard,
  Users,
  Clock,
  ChevronDown,
  Zap,
  Settings as SettingsIcon,
} from 'lucide-react';

interface SidebarItem {
  label: string;
  href: string;
  icon: any;
  requiredRoles?: UserRole[];
  subItems?: { label: string; href: string; requiredRoles?: UserRole[] }[];
}

const sidebarItems: SidebarItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    requiredRoles: ['ADMIN', 'HR', 'EMPLOYEE'],
  },
  {
    label: 'Employees',
    href: '/employees',
    icon: Users,
    requiredRoles: ['ADMIN', 'HR'],
    subItems: [
      { label: 'List', href: '/employees', requiredRoles: ['ADMIN', 'HR'] },
      { label: 'Create', href: '/employees/create', requiredRoles: ['ADMIN', 'HR'] },
    ],
  },
  {
    label: 'Attendance',
    href: '/attendance',
    icon: Clock,
    requiredRoles: ['ADMIN', 'HR', 'EMPLOYEE'],
    subItems: [
      { label: 'Alerts', href: '/alerts', requiredRoles: ['ADMIN', 'HR'] },
    ],
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: SettingsIcon,
    requiredRoles: ['ADMIN', 'HR', 'EMPLOYEE'],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Get role directly from localStorage for immediate availability
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('user_role') as UserRole | null) || null;
    }
    return null;
  });
  
  const [userName, setUserName] = useState<string>('User');

  useEffect(() => {
    setMounted(true);
    
    // Update role and name from localStorage
    const storedRole = (localStorage.getItem('user_role') as UserRole | null) || null;
    const firstName = localStorage.getItem('user_firstName') || 'User';
    const lastName = localStorage.getItem('user_lastName') || '';
    
    setUserRole(storedRole);
    setUserName(`${firstName} ${lastName}`.trim());
  }, []);

  const canViewItem = (requiredRoles?: UserRole[]): boolean => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    return userRole ? requiredRoles.includes(userRole) : false;
  };

  // Filter items based on current role
  const visibleItems = sidebarItems.filter((item) => {
    if (!item.requiredRoles || item.requiredRoles.length === 0) return true;
    return userRole ? item.requiredRoles.includes(userRole) : false;
  });

  return (
    <aside className='w-64 border-r border-border bg-background min-h-screen backdrop-blur-xl shadow-2xl'>
      {/* Sidebar Header */}
      <div className='p-6 border-b border-border'>
        {userRole === 'EMPLOYEE' ? (
          /* Employee View */
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <div className='w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center'>
                <span className='text-white font-bold text-sm'>{userName.charAt(0)}</span>
              </div>
              <div>
                <p className='text-sm font-semibold text-muted-foreground'>{userName}</p>
                <p className='text-xs text-muted-foreground capitalize'>{userRole}</p>
              </div>
            </div>
            <div className='bg-card rounded-lg p-3 border border-border space-y-2'>
              <div className='text-xs text-muted-foreground'>Quick Status</div>
              <Link href='/attendance' className='block'>
                <div className='text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors'>
                  📍 Check Attendance
                </div>
              </Link>
              <Link href='/dashboard' className='block'>
                <div className='text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors'>
                  📊 Dashboard
                </div>
              </Link>
            </div>
          </div>
        ) : (
          /* Admin/HR View */
          <div className='flex items-center gap-2 mb-2'>
            <div className='p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg'>
              <Zap className='text-white' size={20} />
            </div>
            <h1 className='text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
              HR Portal
            </h1>
          </div>
        )}
        
        {userRole !== 'EMPLOYEE' && (
          <p className='text-xs text-muted-foreground'>Analytics & Management</p>
        )}
      </div>

      {/* Navigation */}
      <nav className='p-4 space-y-2'>
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href);
          const hasSubItems = item.subItems && item.subItems.length > 0;
          const visibleSubItems = item.subItems?.filter((sub) => canViewItem(sub.requiredRoles)) || [];
          const Icon = item.icon;

          return (
            <div key={item.href}>
              {hasSubItems && visibleSubItems.length > 0 ? (
                <button
                  onClick={() =>
                    setOpenMenu(openMenu === item.href ? null : item.href)
                  }
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group',
                    isActive
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                      : 'text-muted-foreground hover:bg-card hover:text-muted-foreground border border-transparent'
                  )}
                >
                  <div className='flex items-center gap-3'>
                    <Icon className={cn('w-5 h-5 transition-colors', isActive ? 'text-blue-400' : 'text-muted-foreground group-hover:text-muted-foreground')} />
                    {item.label}
                  </div>
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-all duration-300',
                      openMenu === item.href ? 'rotate-180' : '',
                      isActive ? 'text-blue-400' : 'text-muted-foreground'
                    )}
                  />
                </button>
              ) : (
                <Link href={item.href}>
                  <div
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 group cursor-pointer',
                      isActive
                        ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/10'
                        : 'text-muted-foreground hover:bg-card hover:text-muted-foreground border border-transparent'
                    )}
                  >
                    <Icon className={cn('w-5 h-5 transition-colors', isActive ? 'text-blue-400' : 'text-muted-foreground group-hover:text-muted-foreground')} />
                    {item.label}
                  </div>
                </Link>
              )}

              {hasSubItems && openMenu === item.href && visibleSubItems.length > 0 && (
                <div className='mt-2 ml-4 space-y-1 border-l-2 border-blue-500/30 pl-4 animate-in fade-in slide-in-from-top-2'>
                  {visibleSubItems.map((subItem) => (
                    <Link key={subItem.href} href={subItem.href}>
                      <div
                        className={cn(
                          'px-3 py-2 rounded-lg text-sm transition-all duration-300 group cursor-pointer',
                          pathname === subItem.href
                            ? 'bg-blue-500/20 text-blue-300 font-medium border border-blue-500/30'
                            : 'text-muted-foreground hover:text-muted-foreground hover:bg-card'
                        )}
                      >
                        {subItem.label}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className='absolute bottom-0 w-64 p-4 border-t border-border bg-gradient-to-t from-background/50 to-transparent'>
        <div className='p-4 rounded-lg bg-card border border-border backdrop-blur-xl'>
          <p className='text-xs text-muted-foreground mb-2'>Role</p>
          <p className='text-sm font-semibold text-muted-foreground capitalize'>{userRole || 'Loading...'}</p>
          <p className='text-xs text-muted-foreground mt-1'>HR System v1.0</p>
        </div>
      </div>
    </aside>
  );
}
