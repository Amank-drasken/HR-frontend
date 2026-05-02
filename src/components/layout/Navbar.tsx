'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { logoutUser } from '@/lib/auth';
import { attendanceAPI } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, Search } from 'lucide-react';

type AttendanceRecord = {
  id?: string;
  employeeId?: string | number;
  date?: string;
  checkIn?: string;
  checkOut?: string;
};

const STATUS_OPTIONS = ['Working', 'In Meeting', 'Lunch Break', 'On Call', 'Out of Office'];

const STATUS_STYLES: Record<string, string> = {
  Working: 'bg-green-500/20 text-green-300 border-green-500/30',
  'In Meeting': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'Lunch Break': 'bg-red-500/20 text-red-300 border-red-500/30',
  'On Call': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'Out of Office': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

const parseDateParts = (dateString?: string): { year: number; month: number; day: number } | null => {
  if (!dateString) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateString);
  if (!match) return null;

  return {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10),
    day: parseInt(match[3], 10),
  };
};

const toDateFromTimeString = (timeString: string, dateString?: string): Date | null => {
  if (!timeString) return null;

  if (/T/.test(timeString) || /Z$/.test(timeString) || /^\d{4}-\d{2}-\d{2}/.test(timeString)) {
    const parsed = new Date(timeString);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  const amPmMatch = timeString.match(/\b(AM|PM)\b/i);
  const cleaned = timeString.replace(/\s*(AM|PM)\s*/gi, '').trim();
  const parts = cleaned.split(':');
  if (parts.length < 2) return null;

  let hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) return null;
  if (minutes < 0 || minutes > 59) return null;

  if (amPmMatch) {
    const isPm = amPmMatch[1].toLowerCase() === 'pm';
    if (hours === 12) {
      hours = isPm ? 12 : 0;
    } else if (isPm) {
      hours += 12;
    }
  }

  if (hours < 0 || hours > 23) return null;

  const dateParts = parseDateParts(dateString);
  if (dateParts) {
    return new Date(dateParts.year, dateParts.month - 1, dateParts.day, hours, minutes, 0, 0);
  }

  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
};

const diffMinutes = (start: Date, end: Date): number => {
  let diffMs = end.getTime() - start.getTime();
  if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;
  return Math.floor(diffMs / 60000);
};

const formatDuration = (totalMinutes: number): string => {
  if (!Number.isFinite(totalMinutes) || totalMinutes < 0) return '0h 0m';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
};

export default function Navbar() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const [userInitials, setUserInitials] = useState('US');
  const [userName, setUserName] = useState('User');
  const [userEmail, setUserEmail] = useState('user@example.com');
  const [sessionDuration, setSessionDuration] = useState('0h 0m');
  const [todayDuration, setTodayDuration] = useState('0h 0m');
  const [userStatus, setUserStatus] = useState('Working');
  const [lunchDuration, setLunchDuration] = useState('0h 0m');
  const [lunchStart, setLunchStart] = useState<Date | null>(null);

  useEffect(() => {
    const firstName = localStorage.getItem('user_firstName') || 'User';
    const lastName = localStorage.getItem('user_lastName') || 'System';
    const email = localStorage.getItem('user_email') || 'user@example.com';
    
    setUserInitials((firstName.charAt(0) + lastName.charAt(0)).toUpperCase());
    setUserName(`${firstName} ${lastName}`);
    setUserEmail(email);
  }, []);

  const refreshDurations = async () => {
    if (typeof window === 'undefined') return;

    const userId = localStorage.getItem('user_id');
    if (!userId) {
      setSessionDuration('--');
      setTodayDuration('0h 0m');
      return;
    }

    const todayKey = new Date().toISOString().split('T')[0];
    let records: AttendanceRecord[] = [];

    try {
      const response = await attendanceAPI.getEmployeeAttendance(userId);
      records = response.data || [];
    } catch {
      try {
        const response = await attendanceAPI.getAll();
        records = response.data || [];
      } catch {
        setSessionDuration('--');
        setTodayDuration('0h 0m');
        return;
      }
    }

    const myRecords = records.filter((record) => String(record.employeeId) === String(userId));
    const todayRecords = myRecords.filter((record) => record.date && String(record.date).startsWith(todayKey));

    let totalMinutes = 0;
    let latestOpenRecord: AttendanceRecord | null = null;
    let latestOpenTime: Date | null = null;

    todayRecords.forEach((record) => {
      const checkInDate = record.checkIn ? toDateFromTimeString(record.checkIn, record.date) : null;
      if (!checkInDate) return;

      if (record.checkOut) {
        const checkOutDate = toDateFromTimeString(record.checkOut, record.date);
        if (!checkOutDate) return;
        totalMinutes += diffMinutes(checkInDate, checkOutDate);
      } else {
        totalMinutes += diffMinutes(checkInDate, new Date());
        if (!latestOpenTime || checkInDate > latestOpenTime) {
          latestOpenRecord = record;
          latestOpenTime = checkInDate;
        }
      }
    });

    setTodayDuration(formatDuration(totalMinutes));

    if (latestOpenRecord && latestOpenTime) {
      setSessionDuration(formatDuration(diffMinutes(latestOpenTime, new Date())));
    } else {
      setSessionDuration('--');
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedStatus = localStorage.getItem('user_status');
    const userId = localStorage.getItem('user_id') || 'unknown';
    const lunchStartRaw = localStorage.getItem(`lunch_start_${userId}`);
    if (lunchStartRaw) {
      const parsed = new Date(lunchStartRaw);
      if (!isNaN(parsed.getTime())) {
        setLunchStart(parsed);
      }
    }
    if (savedStatus) {
      setUserStatus(savedStatus);
    }

    refreshDurations();
    const interval = setInterval(refreshDurations, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const tick = () => {
      if (!lunchStart) {
        setLunchDuration('0h 0m');
        return;
      }
      const minutes = diffMinutes(lunchStart, new Date());
      setLunchDuration(formatDuration(minutes));
    };

    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, [lunchStart]);

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleAlerts = () => {
    router.push('/alerts');
  };

  const handleStatusChange = (status: string) => {
    setUserStatus(status);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_status', status);
      const userId = localStorage.getItem('user_id') || 'unknown';
      if (status === 'Lunch Break') {
        const now = new Date();
        setLunchStart(now);
        localStorage.setItem(`lunch_start_${userId}`, now.toISOString());
      } else {
        setLunchStart(null);
        localStorage.removeItem(`lunch_start_${userId}`);
      }
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    logout();
    document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/login');
  };

  return (
    <header className='border-b border-slate-700/50 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl shadow-lg'>
      <div className='flex items-center justify-between px-8 py-4'>
        {/* Left Section */}
        <div className='flex items-center gap-6 flex-1'>
          <h1 className='text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent whitespace-nowrap'>
            HR Management System
          </h1>
          
          {/* Search Bar */}
          <div className='hidden md:flex flex-1 max-w-xs relative'>
            <Search className='absolute left-3 top-2.5 h-4 w-4 text-slate-400' />
            <input
              type='text'
              placeholder='Search employees...'
              className='w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors text-sm'
            />
          </div>
        </div>

        {/* Right Section */}
        <div className='flex items-center gap-4'>
          {/* Login Time + Status */}
          <div className='hidden lg:flex items-center gap-4 rounded-lg border border-slate-700/50 bg-slate-800/40 px-4 py-2'>
            <div className='flex flex-col leading-tight'>
              <span className='text-[10px] uppercase tracking-wide text-slate-500'>Session</span>
              <span className='text-sm font-semibold text-slate-100'>{sessionDuration}</span>
            </div>
            <div className='h-8 w-px bg-slate-700/60'></div>
            <div className='flex flex-col leading-tight'>
              <span className='text-[10px] uppercase tracking-wide text-slate-500'>Today</span>
              <span className='text-sm font-semibold text-slate-100'>{todayDuration}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`ml-2 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  STATUS_STYLES[userStatus] || STATUS_STYLES['Working']
                }`}
                type='button'
              >
                {userStatus}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                className='w-48 bg-slate-800/95 border border-slate-700/50 backdrop-blur-xl rounded-lg shadow-2xl'
              >
                {STATUS_OPTIONS.map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    className='text-slate-200 hover:bg-slate-700/50 hover:text-slate-100 cursor-pointer'
                  >
                    {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            {userStatus === 'Lunch Break' && (
              <div className='ml-2 flex flex-col leading-tight'>
                <span className='text-[10px] uppercase tracking-wide text-slate-500'>Lunch</span>
                <span className='text-xs font-semibold text-amber-300'>{lunchDuration}</span>
              </div>
            )}
          </div>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className='w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center cursor-pointer hover:opacity-90 transition-all border border-blue-400/30 hover:border-blue-400/60 focus:outline-none focus:ring-2 focus:ring-blue-400/50 text-white font-semibold text-sm' type='button'>
              {userInitials}
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align='end' 
              className='w-60 bg-slate-800/95 border border-slate-700/50 backdrop-blur-xl rounded-lg shadow-2xl'
            >
              <div className='px-4 py-3 border-b border-slate-700/30'>
                <p className='text-sm font-semibold text-slate-100'>{userName}</p>
                <p className='text-xs text-slate-400'>{userEmail}</p>
              </div>

              <DropdownMenuItem
                onClick={handleAlerts}
                className='text-slate-200 hover:bg-slate-700/50 hover:text-slate-100 cursor-pointer'
              >
                <span>Alerts</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={handleSettings}
                className='text-slate-200 hover:bg-slate-700/50 hover:text-slate-100 cursor-pointer'
              >
                <Settings className='h-4 w-4 mr-2' />
                <span>Settings & Preferences</span>
              </DropdownMenuItem>

              <div className='border-t border-slate-700/30 my-1'></div>

              <DropdownMenuItem 
                onClick={handleLogout} 
                className='text-red-400 hover:bg-red-500/20 hover:text-red-300 cursor-pointer'
              >
                <LogOut className='h-4 w-4 mr-2' />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Status Bar */}
      <div className='hidden sm:block border-t border-slate-700/30 bg-slate-900/30 px-8 py-2'>
        <div className='flex items-center justify-between text-xs text-slate-400'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <span className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></span>
              <span>System Status: Operational</span>
            </div>
          </div>
          <div className='text-slate-500'>
            Last sync: Just now
          </div>
        </div>
      </div>
    </header>
  );
}
