import { attendanceAPI } from './api';

/**
 * Format time to readable format like "10:30 AM"
 */
const formatTimeReadable = (timeString?: string): string => {
  if (!timeString) return 'N/A';
  try {
    const parts = timeString.split(':');
    let hours = parseInt(parts[0]);
    const minutes = parts[1];
    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${period}`;
  } catch {
    return timeString;
  }
};

/**
 * Auto check-in for employee when they log in
 */
export const autoCheckIn = async (employeeId: string): Promise<boolean> => {
  try {
    console.log('🟢 Auto check-in for employee:', employeeId);
    
    // Call check-in endpoint
    const response = await attendanceAPI.checkIn(employeeId);
    
    if (response.data) {
      const checkInTime = formatTimeReadable(response.data.checkIn);
      console.log(`✅ Auto check-in successful at ${checkInTime}`, response.data);
      // Store the attendance record ID for later check-out
      if (response.data.id) {
        sessionStorage.setItem('currentAttendanceId', response.data.id);
      }
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Auto check-in failed:', error);
    return false;
  }
};

/**
 * Auto check-out for employee when they log out
 */
export const autoCheckOut = async (): Promise<boolean> => {
  try {
    const attendanceId = sessionStorage.getItem('currentAttendanceId');
    
    if (!attendanceId) {
      console.log('ℹ️ No active attendance record to check-out');
      return true; // Not an error, just no record to close
    }

    console.log('🔴 Auto check-out for attendance:', attendanceId);
    
    // Call check-out endpoint
    const response = await attendanceAPI.checkOut(attendanceId);
    
    if (response.data) {
      const checkOutTime = formatTimeReadable(response.data.checkOut);
      console.log(`✅ Auto check-out successful at ${checkOutTime}`, response.data);
      // Clear the stored attendance ID
      sessionStorage.removeItem('currentAttendanceId');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Auto check-out failed:', error);
    return false;
  }
};

/**
 * Get current attendance session ID
 */
export const getCurrentAttendanceId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('currentAttendanceId');
};

/**
 * Clear attendance session
 */
export const clearAttendanceSession = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('currentAttendanceId');
  }
};
