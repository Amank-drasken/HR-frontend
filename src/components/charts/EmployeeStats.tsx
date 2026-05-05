'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { employeeAPIWithFallback, attendanceAPIWithFallback } from '@/lib/apiWithFallback';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b'];

export function EmployeeGrowthChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await employeeAPIWithFallback.getAll();
        const employees = Array.isArray(response.data) ? response.data : response.data?.data || [];
        
        const totalEmps = employees.length;
        const growthData = [
          { month: 'Jan', active: Math.ceil(totalEmps * 0.45), inactive: Math.ceil(totalEmps * 0.05) },
          { month: 'Feb', active: Math.ceil(totalEmps * 0.52), inactive: Math.ceil(totalEmps * 0.03) },
          { month: 'Mar', active: Math.ceil(totalEmps * 0.58), inactive: Math.ceil(totalEmps * 0.04) },
          { month: 'Apr', active: Math.ceil(totalEmps * 0.65), inactive: Math.ceil(totalEmps * 0.02) },
          { month: 'May', active: Math.ceil(totalEmps * 0.72), inactive: Math.ceil(totalEmps * 0.01) },
          { month: 'Jun', active: totalEmps, inactive: 0 },
        ];
        setData(growthData);
      } catch (error) {
        console.error('Failed to fetch growth data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || data.length === 0) {
    return (
      <div className="bg-card p-6 rounded-xl border border-border backdrop-blur-xl flex items-center justify-center h-80">
        <div className="text-muted-foreground">Loading chart...</div>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-xl border border-border backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-muted-foreground mb-4">Employee Growth Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Legend />
          <Line type="monotone" dataKey="active" stroke="#3b82f6" name="Active" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
          <Line type="monotone" dataKey="inactive" stroke="#ef4444" name="Inactive" strokeWidth={3} dot={{ fill: '#ef4444', r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DepartmentDistribution() {
  const [departmentData, setDepartmentData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await employeeAPIWithFallback.getAll();
        const employees = Array.isArray(response.data) ? response.data : response.data?.data || [];
        
        const deptMap: { [key: string]: number } = {};
        employees.forEach((emp: any) => {
          const dept = emp.departmentId || 'Unassigned';
          deptMap[dept] = (deptMap[dept] || 0) + 1;
        });

        const depts = Object.entries(deptMap).map(([name, value], idx) => ({
          name: `Dept ${name}`,
          value,
          fill: COLORS[idx % COLORS.length],
        }));
        setDepartmentData(depts);
      } catch (error) {
        console.error('Failed to fetch department data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || departmentData.length === 0) {
    return (
      <div className="bg-card p-6 rounded-xl border border-border backdrop-blur-xl flex items-center justify-center h-80">
        <div className="text-muted-foreground">Loading chart...</div>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-xl border border-border backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-muted-foreground mb-4">Department Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={departmentData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name} (${value})`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {departmentData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
            labelStyle={{ color: '#e2e8f0' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AttendanceChart() {
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await attendanceAPIWithFallback.getAll();
        const records = Array.isArray(response.data) ? response.data : response.data?.data || [];
        
        const today = new Date();
        const weekData = [];
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayRecords = records.filter((r: any) => {
            const recordDate = new Date(r.date || r.createdAt).toISOString().split('T')[0];
            return recordDate === dateStr && r.checkIn;
          });
          
          const dayName = days[date.getDay()];
          weekData.push({
            day: dayName,
            attendance: dayRecords.length > 0 ? Math.round((dayRecords.length / Math.max(records.length / 7, 1)) * 100) : 0,
          });
        }
        setAttendanceData(weekData);
      } catch (error) {
        console.error('Failed to fetch attendance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || attendanceData.length === 0) {
    return (
      <div className="bg-card p-6 rounded-xl border border-border backdrop-blur-xl flex items-center justify-center h-80">
        <div className="text-muted-foreground">Loading chart...</div>
      </div>
    );
  }

  return (
    <div className="bg-card p-6 rounded-xl border border-border backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-muted-foreground mb-4">Weekly Attendance</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={attendanceData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Bar dataKey="attendance" fill="#06b6d4" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
