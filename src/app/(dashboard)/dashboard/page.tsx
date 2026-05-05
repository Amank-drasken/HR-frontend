'use client';

import { useEffect, useState } from 'react';
import { EnhancedDashboardCards } from '@/components/dashboard/StatCard';
import { EmployeeGrowthChart, DepartmentDistribution, AttendanceChart } from '@/components/charts/EmployeeStats';
import { AttendanceTrendChart } from '@/components/charts/AttendanceStats';
import Link from 'next/link';
import { Users, BarChart3, TrendingUp } from 'lucide-react';
import { getUserRole } from '@/lib/roleGuard';
import type { UserRole } from '@/lib/roleGuard';

type CompanyAlert = {
  id: string;
  title: string;
  message: string;
  time: string;
};

export default function DashboardPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [alerts, setAlerts] = useState<CompanyAlert[]>([]);

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('company_alerts');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as CompanyAlert[];
        if (Array.isArray(parsed)) {
          setAlerts(parsed);
        }
      } catch {
        // Ignore invalid stored data
      }
    }
  }, []);


  const canManageEmployees = userRole === 'ADMIN' || userRole === 'HR';

  return (
    <div className='min-h-screen bg-background p-8'>
      {/* Header */}
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2'>
              Analytics Dashboard
            </h1>
            <p className='text-muted-foreground'>Real-time HR metrics and insights</p>
          </div>
          <div className='p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg'>
            <BarChart3 className='text-white' size={32} />
          </div>
        </div>
      </div>

      {/* KPI Cards - Only show for ADMIN/HR */}
      {canManageEmployees && <EnhancedDashboardCards />}

      {/* Charts Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        <EmployeeGrowthChart />
        {canManageEmployees ? <DepartmentDistribution /> : <EmployeeAlerts alerts={alerts} />}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        <AttendanceChart />
        <AttendanceTrendChart />
      </div>

      {/* Quick Actions */}
      <div className={`grid ${canManageEmployees ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-1'} gap-4`}>
        {canManageEmployees && (
          <Link href='/employees' className='group'>
            <div className='bg-gradient-to-br from-blue-900/30 to-blue-800/30 p-6 rounded-xl border border-blue-700/50 backdrop-blur-xl hover:border-blue-600 transition-all duration-300 cursor-pointer hover:scale-105 transform'>
              <div className='flex items-center gap-3 mb-2'>
                <Users className='text-blue-400' size={24} />
                <h3 className='text-lg font-semibold text-muted-foreground'>View Employees</h3>
              </div>
              <p className='text-sm text-muted-foreground'>Manage all employee records</p>
            </div>
          </Link>
        )}

        {canManageEmployees && (
          <Link href='/employees/create' className='group'>
            <div className='bg-gradient-to-br from-purple-900/30 to-purple-800/30 p-6 rounded-xl border border-purple-700/50 backdrop-blur-xl hover:border-purple-600 transition-all duration-300 cursor-pointer hover:scale-105 transform'>
              <div className='flex items-center gap-3 mb-2'>
                <TrendingUp className='text-purple-400' size={24} />
                <h3 className='text-lg font-semibold text-muted-foreground'>Add Employee</h3>
              </div>
              <p className='text-sm text-muted-foreground'>Create new employee record</p>
            </div>
          </Link>
        )}

        <Link href='/attendance' className='group'>
          <div className='bg-gradient-to-br from-emerald-900/30 to-emerald-800/30 p-6 rounded-xl border border-emerald-700/50 backdrop-blur-xl hover:border-emerald-600 transition-all duration-300 cursor-pointer hover:scale-105 transform'>
            <div className='flex items-center gap-3 mb-2'>
              <BarChart3 className='text-emerald-400' size={24} />
              <h3 className='text-lg font-semibold text-muted-foreground'>Attendance</h3>
            </div>
            <p className='text-sm text-muted-foreground'>Track daily attendance</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function EmployeeAlerts({ alerts }: { alerts: CompanyAlert[] }) {
  const hasAlerts = alerts.length > 0;

  return (
    <div className='bg-card rounded-xl border border-border backdrop-blur-xl p-6 shadow-2xl'>
      <h3 className='text-lg font-semibold text-muted-foreground mb-4'>Alerts</h3>
      <div className='space-y-4'>
        {!hasAlerts && (
          <div className='rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground'>
            No alerts yet.
          </div>
        )}
        {alerts.map((alert) => (
          <div key={alert.id} className='rounded-lg border border-border bg-card p-4'>
            <div className='flex items-center justify-between'>
              <p className='text-sm font-semibold text-muted-foreground'>{alert.title}</p>
              <span className='text-xs text-muted-foreground'>{alert.time}</span>
            </div>
            <p className='mt-2 text-sm text-muted-foreground'>{alert.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
