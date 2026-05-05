'use client';

import { useEffect, useState } from 'react';
import { getUserRole } from '@/lib/roleGuard';
import type { UserRole } from '@/lib/roleGuard';

type CompanyAlert = {
  id: string;
  title: string;
  message: string;
  time: string;
};

export default function AlertsPage() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [alerts, setAlerts] = useState<CompanyAlert[]>([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('company_alerts');
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as CompanyAlert[];
      if (Array.isArray(parsed)) {
        setAlerts(parsed);
      }
    } catch {
      // Ignore invalid stored data
    }
  }, []);

  const saveAlerts = (nextAlerts: CompanyAlert[]) => {
    setAlerts(nextAlerts);
    if (typeof window !== 'undefined') {
      localStorage.setItem('company_alerts', JSON.stringify(nextAlerts));
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const now = new Date();
    const newAlert: CompanyAlert = {
      id: `alert-${now.getTime()}`,
      title: title.trim(),
      message: message.trim(),
      time: now.toLocaleString(),
    };

    saveAlerts([newAlert, ...alerts]);
    setTitle('');
    setMessage('');
  };

  const canSendAlerts = userRole === 'ADMIN' || userRole === 'HR';

  return (
    <div className='min-h-screen bg-background p-8'>
      <div className='mb-8'>
        <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2'>
          Company Alerts
        </h1>
        <p className='text-muted-foreground'>Updates shared by HR and Admin</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-card rounded-xl border border-border backdrop-blur-xl p-6 shadow-2xl'>
          <h3 className='text-lg font-semibold text-muted-foreground mb-4'>Alerts</h3>
          <div className='space-y-4'>
            {alerts.length === 0 && (
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

        {canSendAlerts && (
          <div className='bg-card rounded-xl border border-border backdrop-blur-xl p-6 shadow-2xl'>
            <h3 className='text-lg font-semibold text-muted-foreground mb-4'>Send Alert</h3>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='block text-xs uppercase tracking-wide text-muted-foreground mb-2'>Title</label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className='w-full rounded-lg bg-card border border-border px-3 py-2 text-sm text-muted-foreground placeholder-slate-500 focus:outline-none focus:border-blue-500'
                  placeholder='Company update'
                />
              </div>
              <div>
                <label className='block text-xs uppercase tracking-wide text-muted-foreground mb-2'>Message</label>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className='min-h-[120px] w-full rounded-lg bg-card border border-border px-3 py-2 text-sm text-muted-foreground placeholder-slate-500 focus:outline-none focus:border-blue-500'
                  placeholder='Write alert message for all employees'
                />
              </div>
              <button
                type='submit'
                className='inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors'
              >
                Send to All Employees
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
