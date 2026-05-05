'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { employeeAPIWithFallback } from '@/lib/apiWithFallback';
import { getUserRole } from '@/lib/roleGuard';
import { Plus, Search, Users, TrendingUp, Filter } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: string;
  locationId: string;
  createdAt: string;
  status?: string;
}

export default function EmployeesPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Check role - only ADMIN and HR can view
    const userRole = getUserRole();
    if (userRole !== 'ADMIN' && userRole !== 'HR') {
      router.push('/dashboard');
      return;
    }

    const fetchEmployees = async () => {
      try {
        const response = await employeeAPIWithFallback.getAll();
        setEmployees(response.data);
        setFilteredEmployees(response.data);
      } catch (error: any) {
        console.error('Failed to fetch employees:', error?.message);
        // Don't throw error - let page continue with fallback or empty state
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, [router]);

  // Handle search filtering
  useEffect(() => {
    const filtered = employees.filter((emp) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        emp.firstName.toLowerCase().includes(searchLower) ||
        emp.lastName.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower) ||
        emp.phone.includes(searchTerm)
      );
    });
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const SkeletonLoader = () => (
    <>
      {[...Array(5)].map((_, i) => (
        <TableRow key={i} className='border-border'>
          <TableCell>
            <Skeleton className='h-4 w-12 bg-card' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-24 bg-card' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-32 bg-card' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-20 bg-card' />
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
        </TableRow>
      ))}
    </>
  );

  const getStatusColor = (status?: string) => {
    const statusStr = String(status || '').toLowerCase();
    switch(statusStr) {
      case 'active':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'inactive':
        return 'bg-card text-muted-foreground border-border';
      case 'on-leave':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className='min-h-screen bg-background p-8'>
      {/* Header Section */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <div className='flex items-center gap-3 mb-2'>
            <Users className='text-blue-400' size={32} />
            <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent'>
              Employee Directory
            </h1>
          </div>
          <p className='text-muted-foreground'>Manage and organize employee records</p>
        </div>
        <Link href='/employees/create'>
          <Button className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 gap-2 text-white border-0 shadow-lg hover:shadow-xl transition-all'>
            <Plus className='w-4 h-4' />
            Add Employee
          </Button>
        </Link>
      </div>



      {/* Stats Cards */}
      <div className='grid grid-cols-3 gap-4 mb-8'>
        <div className='bg-card p-4 rounded-lg border border-border backdrop-blur-xl'>
          <p className='text-muted-foreground text-sm mb-1'>Total Employees</p>
          <p className='text-2xl font-bold text-blue-400'>{employees.length}</p>
        </div>
        <div className='bg-card p-4 rounded-lg border border-border backdrop-blur-xl'>
          <p className='text-muted-foreground text-sm mb-1'>Active Today</p>
          <p className='text-2xl font-bold text-emerald-400'>{employees.length}</p>
        </div>
        <div className='bg-card p-4 rounded-lg border border-border backdrop-blur-xl'>
          <p className='text-muted-foreground text-sm mb-1'>Showing</p>
          <p className='text-2xl font-bold text-purple-400'>{filteredEmployees.length}</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className='bg-card rounded-xl border border-border backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-border shadow-2xl'>
        
        {/* Search Bar */}
        <div className='p-6 border-b border-border'>
          <div className='flex gap-3'>
            <div className='flex-1 relative'>
              <Search className='absolute left-3 top-3 h-5 w-5 text-muted-foreground' />
              <Input
                placeholder='Search by name, email, or phone...'
                className='pl-10 bg-card border-border text-muted-foreground placeholder-slate-500 hover:border-border focus:border-blue-500 transition-colors'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant='outline' className='border-border text-muted-foreground hover:bg-card'>
              <Filter className='w-4 h-4' />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className='overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow className='border-border hover:bg-transparent'>
                <TableHead className='font-semibold text-muted-foreground bg-card'>ID</TableHead>
                <TableHead className='font-semibold text-muted-foreground bg-card'>Name</TableHead>
                <TableHead className='font-semibold text-muted-foreground bg-card'>Email</TableHead>
                <TableHead className='font-semibold text-muted-foreground bg-card'>Phone</TableHead>
                <TableHead className='font-semibold text-muted-foreground bg-card'>Department</TableHead>
                <TableHead className='font-semibold text-muted-foreground bg-card'>Location</TableHead>
                <TableHead className='font-semibold text-muted-foreground bg-card'>Joined</TableHead>
                <TableHead className='font-semibold text-muted-foreground bg-card'>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <SkeletonLoader />
              ) : filteredEmployees.length > 0 ? (
                filteredEmployees.map((employee) => (
                  <TableRow 
                    key={employee.id} 
                    className='border-border hover:bg-muted/50 transition-colors cursor-pointer'
                    onClick={() => router.push(`/employees/${employee.id}`)}
                  >
                    <TableCell className='font-mono text-xs text-muted-foreground py-3'>{String(employee.id).slice(0, 8)}</TableCell>
                    <TableCell className='font-semibold text-primary hover:underline py-3'>
                      {employee.firstName} {employee.lastName}
                    </TableCell>
                    <TableCell className='text-muted-foreground py-3 text-sm'>{employee.email}</TableCell>
                    <TableCell className='text-muted-foreground py-3 text-sm'>{employee.phone}</TableCell>
                    <TableCell className='text-muted-foreground py-3 text-sm'>{employee.departmentId || '-'}</TableCell>
                    <TableCell className='text-muted-foreground py-3 text-sm'>{employee.locationId || '-'}</TableCell>
                    <TableCell className='text-muted-foreground py-3 text-sm'>
                      {format(new Date(employee.createdAt), 'MMM dd')}
                    </TableCell>
                    <TableCell className='py-3'>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${getStatusColor(employee.status)}`}>
                        {employee.status || 'Active'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className='border-border'>
                  <TableCell colSpan={8} className='text-center py-12'>
                    <div className='flex flex-col items-center gap-2'>
                      <Users className='text-muted-foreground' size={32} />
                      <p className='text-muted-foreground'>No employees found</p>
                      <p className='text-muted-foreground text-sm'>Try adjusting your search filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer Stats */}
        <div className='border-t border-border px-6 py-4 bg-card flex items-center justify-between'>
          <p className='text-sm text-muted-foreground'>
            Showing <span className='text-muted-foreground font-semibold'>{filteredEmployees.length}</span> of <span className='text-muted-foreground font-semibold'>{employees.length}</span> employees
          </p>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <TrendingUp size={16} />
            Real-time data
          </div>
        </div>
      </div>
    </div>
  );
}
