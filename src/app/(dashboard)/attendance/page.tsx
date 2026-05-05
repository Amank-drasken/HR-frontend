'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { attendanceAPIWithFallback } from '@/lib/apiWithFallback';
import { Clock, TrendingUp, Calendar } from 'lucide-react';
import { DepartmentAttendanceChart, AttendanceTrendChart } from '@/components/charts/AttendanceStats';
import { format } from 'date-fns';

interface Attendance {
  id: string;
  employeeId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
}

export default function AttendancePage() {
  const router = useRouter();
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const fetchAttendance = async () => {
    try {
      const response = await attendanceAPIWithFallback.getAll();
      // Handle multiple response formats
      let allRecords: Attendance[] = [];
      
      if (Array.isArray(response.data)) {
        allRecords = response.data;
      } else if (Array.isArray(response.data?.data)) {
        allRecords = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // If it's an object with data property that's an array
        const data = Object.values(response.data).find(v => Array.isArray(v));
        allRecords = Array.isArray(data) ? data : [];
      }
      
      // Filter to show only current user's attendance (unless ADMIN/HR)
      const userRole = localStorage.getItem('user_role');
      const userId = localStorage.getItem('user_id');
      
      const filtered = userRole === 'ADMIN' || userRole === 'HR' 
        ? allRecords 
        : allRecords.filter((a: Attendance) => String(a.employeeId) === userId);
      
      setAttendance(filtered);
    } catch (error: any) {
      console.error('Failed to fetch attendance:', error?.message);
      // Don't throw error - let page continue with empty state or fallback data
      setAttendance([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchAttendance();
    
    // Refresh attendance data every 10 seconds for live updates
    const interval = setInterval(fetchAttendance, 10000);
    return () => clearInterval(interval);
  }, [router]);

  useEffect(() => {
    const interval = setInterval(() => setTick((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const SkeletonLoader = () => (
    <>
      {[...Array(8)].map((_, i) => (
        <TableRow key={i} className='border-border'>
          <TableCell>
            <Skeleton className='h-4 w-12 bg-card' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-24 bg-card' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-24 bg-card' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-20 bg-card' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-20 bg-card' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-20 bg-card' />
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const userRole = localStorage.getItem('user_role');
    const userId = localStorage.getItem('user_id');
    
    // Filter to show only current user's stats (unless ADMIN/HR)
    let todayRecords = attendance.filter((a: Attendance) => {
      const matchDate = a.date && (typeof a.date === 'string' ? a.date.startsWith(today) : false);
      if (userRole === 'ADMIN' || userRole === 'HR') {
        return matchDate;
      }
      return matchDate && String(a.employeeId) === userId;
    });
    
    return {
      total: todayRecords.length,
      checkedIn: todayRecords.filter((a: Attendance) => a.checkIn).length,
      checkedOut: todayRecords.filter((a: Attendance) => a.checkOut).length,
    };
  };

  const calculateAvgHours = () => {
    if (attendance.length === 0) return '0h 0m';

    let totalMinutes = 0;
    let recordsWithHours = 0;

    attendance.forEach((record) => {
      if (record.checkIn && record.checkOut) {
        const checkInDate = toDateFromTimeString(record.checkIn, record.date);
        const checkOutDate = toDateFromTimeString(record.checkOut, record.date);

        if (!checkInDate || !checkOutDate) return;

        let diffMs = checkOutDate.getTime() - checkInDate.getTime();
        if (diffMs < 0) {
          diffMs += 24 * 60 * 60 * 1000;
        }

        totalMinutes += Math.floor(diffMs / 60000);
        recordsWithHours++;
      }
    });

    if (recordsWithHours === 0) return '0h 0m';

    const avgTotalMinutes = Math.floor(totalMinutes / recordsWithHours);
    const avgHours = Math.floor(avgTotalMinutes / 60);
    const avgMinutes = avgTotalMinutes % 60;

    return `${avgHours}h ${avgMinutes}m`;
  };

  const stats = getTodayStats();
  const latestAttendance = attendance
    .slice()
    .sort((a, b) => {
      const aTime = a.checkIn ? toDateFromTimeString(a.checkIn, a.date)?.getTime() || 0 : 0;
      const bTime = b.checkIn ? toDateFromTimeString(b.checkIn, b.date)?.getTime() || 0 : 0;
      return bTime - aTime;
    })
    .filter((record, index, list) =>
      index === list.findIndex((item) => String(item.employeeId) === String(record.employeeId))
    );

  return (
    <div className='min-h-screen bg-background p-8'>
      {/* Header Section */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <div className='flex items-center gap-3'>
            <Clock className='text-emerald-400' size={32} />
            <h1 className='text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent'>
              Attendance Tracker
            </h1>
          </div>
          <p className='text-muted-foreground'>Real-time employee attendance and analytics</p>
        </div>
      </div>



      {/* KPI Cards */}
      <div className='grid grid-cols-4 gap-4 mb-8'>
        <div className='bg-gradient-to-br from-emerald-900/30 to-emerald-800/30 p-6 rounded-xl border border-emerald-700/50 backdrop-blur-xl'>
          <p className='text-muted-foreground text-sm mb-2'>Today Checked In</p>
          <p className='text-3xl font-bold text-emerald-400'>{stats.checkedIn}</p>
          <p className='text-xs text-muted-foreground mt-2'>Current session</p>
        </div>
        
        <div className='bg-gradient-to-br from-blue-900/30 to-blue-800/30 p-6 rounded-xl border border-blue-700/50 backdrop-blur-xl'>
          <p className='text-muted-foreground text-sm mb-2'>Total Records Today</p>
          <p className='text-3xl font-bold text-blue-400'>{stats.total}</p>
          <p className='text-xs text-muted-foreground mt-2'>Updated now</p>
        </div>

        <div className='bg-gradient-to-br from-purple-900/30 to-purple-800/30 p-6 rounded-xl border border-purple-700/50 backdrop-blur-xl'>
          <p className='text-muted-foreground text-sm mb-2'>Checked Out</p>
          <p className='text-3xl font-bold text-purple-400'>{stats.checkedOut}</p>
          <p className='text-xs text-muted-foreground mt-2'>End of shift</p>
        </div>

        <div className='bg-gradient-to-br from-amber-900/30 to-amber-800/30 p-6 rounded-xl border border-amber-700/50 backdrop-blur-xl'>
          <p className='text-muted-foreground text-sm mb-2'>Avg. Hours</p>
          <p className='text-3xl font-bold text-amber-400'>{calculateAvgHours()}</p>
          <p className='text-xs text-muted-foreground mt-2'>Per employee</p>
        </div>
      </div>

      {/* Charts - Full Width */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
        <AttendanceTrendChart />
        <DepartmentAttendanceChart />
      </div>

      {/* Tabs Section - Records Only */}
      <div className='bg-card rounded-xl border border-border backdrop-blur-xl overflow-hidden shadow-2xl'>
        <div className='p-6 border-b border-border'>
          <div className='flex items-center gap-2'>
            <Calendar className='w-5 h-5 text-blue-400' />
            <h3 className='text-lg font-semibold text-muted-foreground'>Attendance Records</h3>
          </div>
        </div>
            <div className='overflow-x-auto'>
              <Table>
                <TableHeader>
                  <TableRow className='border-border hover:bg-transparent'>
                    <TableHead className='font-semibold text-muted-foreground bg-card'>ID</TableHead>
                    <TableHead className='font-semibold text-muted-foreground bg-card'>Employee</TableHead>
                    <TableHead className='font-semibold text-muted-foreground bg-card'>Date</TableHead>
                    <TableHead className='font-semibold text-muted-foreground bg-card'>Check In</TableHead>
                    <TableHead className='font-semibold text-muted-foreground bg-card'>Check Out</TableHead>
                    <TableHead className='font-semibold text-muted-foreground bg-card'>Duration</TableHead>
                    <TableHead className='font-semibold text-muted-foreground bg-card'>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <SkeletonLoader />
                  ) : latestAttendance.length > 0 ? (
                    latestAttendance.map((record) => {
                      void tick;
                      const duration =
                        record.checkOut && record.checkIn
                          ? calculateDuration(record.checkIn, record.checkOut, record.date)
                          : record.checkIn
                          ? calculateLiveDuration(record.checkIn, record.date)
                          : '-';
                      
                      const isOnTime = record.checkIn && parseInt(record.checkIn) <= 9;

                      return (
                        <TableRow key={record.id} className='border-border hover:bg-card transition-colors'>
                          <TableCell className='font-mono text-xs text-muted-foreground py-3'>
                            {String(record.id).slice(0, 8)}
                          </TableCell>
                          <TableCell className='font-semibold text-muted-foreground py-3'>
                            {record.employeeId}
                          </TableCell>
                          <TableCell className='text-muted-foreground py-3 text-sm'>
                            {format(new Date(record.date), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell className='text-muted-foreground py-3 text-sm font-mono'>
                            {formatTime(record.checkIn, record.date)}
                          </TableCell>
                          <TableCell className='text-muted-foreground py-3 text-sm font-mono'>
                            {formatTime(record.checkOut || '', record.date)}
                          </TableCell>
                          <TableCell className='py-3'>
                            <span className='inline-flex items-center rounded-full bg-cyan-500/20 text-cyan-300 px-3 py-1 text-xs font-medium border border-cyan-500/30'>
                              {duration}
                            </span>
                          </TableCell>
                          <TableCell className='py-3'>
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${
                              isOnTime 
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            }`}>
                              {isOnTime ? 'On Time' : 'Late'}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow className='border-border'>
                      <TableCell colSpan={7} className='text-center py-12'>
                        <div className='flex flex-col items-center gap-2'>
                          <Clock className='text-muted-foreground' size={32} />
                          <p className='text-muted-foreground'>No attendance records found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className='border-t border-border px-6 py-4 bg-card flex items-center justify-between text-sm'>
              <p className='text-muted-foreground'>
                Total records: <span className='text-muted-foreground font-semibold'>{attendance.length}</span>
              </p>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <TrendingUp size={16} />
                Live tracking enabled
              </div>
            </div>
      </div>
    </div>
  );
}

function parseDateParts(dateString?: string): { year: number; month: number; day: number } | null {
  if (!dateString) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateString);
  if (!match) return null;

  return {
    year: parseInt(match[1], 10),
    month: parseInt(match[2], 10),
    day: parseInt(match[3], 10),
  };
}

function toDateFromTimeString(timeString: string, dateString?: string): Date | null {
  if (!timeString) return null;

  // If string looks like a full ISO datetime, parse directly (keeps timezone info)
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
}

function calculateDuration(checkIn: string, checkOut: string, dateString?: string): string {
  const inDate = toDateFromTimeString(checkIn, dateString);
  const outDate = toDateFromTimeString(checkOut, dateString);

  if (!inDate || !outDate) return '-';

  let diffMs = outDate.getTime() - inDate.getTime();
  if (diffMs < 0) {
    diffMs += 24 * 60 * 60 * 1000;
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}

function calculateLiveDuration(checkIn: string, dateString?: string): string {
  const inDate = toDateFromTimeString(checkIn, dateString);
  if (!inDate) return '-';

  const now = new Date();
  let diffMs = now.getTime() - inDate.getTime();
  if (diffMs < 0) {
    diffMs += 24 * 60 * 60 * 1000;
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}

function formatTime(timeString: string, dateString?: string): string {
  if (!timeString || timeString === '-') return '-';

  const date = toDateFromTimeString(timeString, dateString);
  if (!date) return '-';

  return format(date, 'hh:mm a');
}
