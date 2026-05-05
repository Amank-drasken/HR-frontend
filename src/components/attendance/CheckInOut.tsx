'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle, LogIn, LogOut, Loader } from 'lucide-react';
import { attendanceAPI } from '@/lib/api';
import { format } from 'date-fns';

interface CheckInOutProps {
  onCheckInSuccess?: () => void;
  onCheckOutSuccess?: () => void;
}

export default function CheckInOut({ onCheckInSuccess, onCheckOutSuccess }: CheckInOutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  // Load today's attendance record on mount
  useEffect(() => {
    loadTodayRecord();
  }, []);

  const loadTodayRecord = async () => {
    try {
      const response = await attendanceAPI.getAll();
      const records = Array.isArray(response.data) ? response.data : response.data.data || [];
      const today = new Date().toISOString().split('T')[0];
      
      const todayRec = records.find((r: any) => 
        new Date(r.date).toISOString().split('T')[0] === today
      );

      if (todayRec) {
        setTodayRecord(todayRec);
        // Only checked in if checkIn exists AND checkOut does NOT exist
        setIsCheckedIn(!!todayRec.checkIn && !todayRec.checkOut);
      } else {
        setTodayRecord(null);
        setIsCheckedIn(false);
      }
    } catch (err) {
      console.error('Failed to load today record:', err);
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  const handleCheckIn = async () => {
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);

      // Get employee ID from localStorage
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        setError('User ID not found. Please login again.');
        return;
      }

      const currentTime = getCurrentTime();

      // Call the correct backend endpoint
      await attendanceAPI.checkIn(userId);
      setSuccess('✅ Checked in successfully at ' + currentTime);
      setIsCheckedIn(true);
      
      // Reload record
      setTimeout(() => {
        loadTodayRecord();
        if (onCheckInSuccess) onCheckInSuccess();
      }, 500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setError(null);
      setSuccess(null);
      setLoading(true);

      if (!todayRecord?.id) {
        setError('No check-in record found for today. Please check in first.');
        return;
      }

      const currentTime = getCurrentTime();

      // Call the correct backend endpoint
      await attendanceAPI.checkOut(String(todayRecord.id));

      setSuccess('✅ Checked out successfully at ' + currentTime);
      setIsCheckedIn(false);

      // Reload record
      setTimeout(() => {
        loadTodayRecord();
        if (onCheckOutSuccess) onCheckOutSuccess();
      }, 500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className='p-6 bg-gradient-to-br from-background/50 to-background/50 border-border'>
      <div className='space-y-4'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h3 className='text-lg font-semibold text-muted-foreground'>Quick Check In/Out</h3>
            <p className='text-sm text-muted-foreground mt-1'>Manage your attendance with one click</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isCheckedIn 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : 'bg-card text-muted-foreground border border-border'
          }`}>
            {isCheckedIn ? '✓ Checked In' : 'Not Checked In'}
          </div>
        </div>

        {error && (
          <div className='p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3'>
            <AlertCircle className='w-5 h-5 text-red-400 mt-0.5 flex-shrink-0' />
            <p className='text-sm text-red-300'>{error}</p>
          </div>
        )}

        {success && (
          <div className='p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-start gap-3'>
            <CheckCircle className='w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0' />
            <p className='text-sm text-emerald-300'>{success}</p>
          </div>
        )}

        {todayRecord && (
          <div className='p-4 bg-card border border-border rounded-lg space-y-2'>
            <div className='text-sm'>
              <span className='text-muted-foreground'>Check In: </span>
              <span className='text-muted-foreground font-mono'>{todayRecord.checkIn || '—'}</span>
            </div>
            <div className='text-sm'>
              <span className='text-muted-foreground'>Check Out: </span>
              <span className='text-muted-foreground font-mono'>{todayRecord.checkOut || '—'}</span>
            </div>
            {todayRecord.checkIn && todayRecord.checkOut && (
              <div className='text-sm'>
                <span className='text-muted-foreground'>Duration: </span>
                <span className='text-emerald-300 font-mono font-semibold'>
                  {(() => {
                    const [inH, inM] = todayRecord.checkIn.split(':').map(Number);
                    const [outH, outM] = todayRecord.checkOut.split(':').map(Number);
                    const mins = (outH * 60 + outM) - (inH * 60 + inM);
                    const hours = Math.floor(mins / 60);
                    const remaining = mins % 60;
                    return `${hours}h ${remaining}m`;
                  })()}
                </span>
              </div>
            )}
          </div>
        )}

        <div className='flex gap-3 pt-4'>
          <Button
            onClick={handleCheckIn}
            disabled={loading || isCheckedIn}
            className='flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? (
              <>
                <Loader className='w-4 h-4 mr-2 animate-spin' />
                Processing...
              </>
            ) : (
              <>
                <LogIn className='w-4 h-4 mr-2' />
                Check In
              </>
            )}
          </Button>

          <Button
            onClick={handleCheckOut}
            disabled={loading || !isCheckedIn}
            className='flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading ? (
              <>
                <Loader className='w-4 h-4 mr-2 animate-spin' />
                Processing...
              </>
            ) : (
              <>
                <LogOut className='w-4 h-4 mr-2' />
                Check Out
              </>
            )}
          </Button>
        </div>

        <p className='text-xs text-muted-foreground text-center pt-2'>
          Current time: {format(new Date(), 'HH:mm:ss')}
        </p>
      </div>
    </Card>
  );
}
