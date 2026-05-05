'use client';

import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { attendanceAPIWithFallback, employeeAPIWithFallback } from '@/lib/apiWithFallback';

export function AttendanceTrendChart() {
  const [trendData, setTrendData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await attendanceAPIWithFallback.getAll();
        const records = Array.isArray(response.data) ? response.data : response.data?.data || [];
        
        const today = new Date();
        const weeks = [];
        
        for (let week = 3; week >= 0; week--) {
          const weekStart = new Date(today);
          weekStart.setDate(weekStart.getDate() - (week * 7 + 6));
          
          let presentCount = 0;
          let absentCount = 0;
          
          for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            
            const dayRecords = records.filter((r: any) => {
              const recordDate = new Date(r.date || r.createdAt).toISOString().split('T')[0];
              return recordDate === dateStr;
            });
            
            presentCount += dayRecords.filter((r: any) => r.checkIn).length;
            absentCount += Math.max(0, Math.ceil(records.length / 30) - dayRecords.filter((r: any) => r.checkIn).length);
          }
          
          weeks.push({
            week: `Week ${4 - week}`,
            present: presentCount,
            absent: absentCount,
            late: Math.ceil(presentCount * 0.1),
          });
        }
        
        setTrendData(weeks);
      } catch (error) {
        console.error('Failed to fetch trend data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || trendData.length === 0) {
    return (
      <div className="bg-card p-6 rounded-xl border border-border backdrop-blur-xl flex items-center justify-center h-80">
        <div className="text-muted-foreground">Loading chart...</div>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-xl border border-border backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-muted-foreground mb-4">Attendance Trend (Last 4 Weeks)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Legend />
          <Area type="monotone" dataKey="present" stackId="1" stroke="#06b6d4" fillOpacity={1} fill="url(#colorPresent)" name="Present" />
          <Area type="monotone" dataKey="absent" stackId="1" stroke="#ef4444" fillOpacity={1} fill="url(#colorAbsent)" name="Absent" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DepartmentAttendanceChart() {
  const [deptData, setDeptData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const empResponse = await employeeAPIWithFallback.getAll();
        const employees = Array.isArray(empResponse.data) ? empResponse.data : empResponse.data?.data || [];
        
        const attResponse = await attendanceAPIWithFallback.getAll();
        const records = Array.isArray(attResponse.data) ? attResponse.data : attResponse.data?.data || [];
        
        const deptMap: { [key: string]: { present: number; total: number } } = {};
        
        employees.forEach((emp: any) => {
          const dept = emp.departmentId || 'Unassigned';
          if (!deptMap[dept]) {
            deptMap[dept] = { present: 0, total: 0 };
          }
          deptMap[dept].total += 1;
        });
        
        records.forEach((rec: any) => {
          const emp = employees.find((e: any) => e.id === rec.employeeId);
          if (emp && rec.checkIn) {
            const dept = emp.departmentId || 'Unassigned';
            if (deptMap[dept]) {
              deptMap[dept].present += 1;
            }
          }
        });
        
        const depts = Object.entries(deptMap).map(([dept, data]) => ({
          dept: `Dept ${dept}`,
          attendance: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
        }));
        
        setDeptData(depts);
      } catch (error) {
        console.error('Failed to fetch department attendance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || deptData.length === 0) {
    return (
      <div className="bg-card p-6 rounded-xl border border-border backdrop-blur-xl flex items-center justify-center h-80">
        <div className="text-muted-foreground">Loading chart...</div>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-xl border border-border backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-muted-foreground mb-4">Department Attendance Rate</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={deptData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis stroke="#94a3b8" angle={-45} textAnchor="end" height={100} />
          <YAxis stroke="#94a3b8" domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Bar dataKey="attendance" fill="#10b981" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
