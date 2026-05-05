'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EmployeeProfile from '@/components/employees/EmployeeProfile';
import { employeeAPIWithFallback } from '@/lib/apiWithFallback';
import { Skeleton } from '@/components/ui/skeleton';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  dob?: string;
  gender?: string;
  fatherName?: string;
  localAddress?: string;
  permanentAddress?: string;
  dateOfJoining?: string;
  salary?: string;
  bankAccountHolder?: string;
  bankAccountNumber?: string;
  bankName?: string;
  panNumber?: string;
  ifscCode?: string;
  branch?: string;
}

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchEmployee = async () => {
      try {
        setIsLoading(true);
        const response = await employeeAPIWithFallback.getById(employeeId);
        const data = response.data?.data ?? response.data;
        setEmployee(data || null);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch employee:', err?.message);
        setError('Failed to load employee profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (employeeId) {
      fetchEmployee();
    }
  }, [employeeId, router]);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-background p-6'>
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className='mb-6 text-muted-foreground hover:text-foreground'
        >
          <ArrowLeft className='w-4 h-4 mr-2' />
          Back
        </Button>
        <div className='space-y-6'>
          <Skeleton className='h-8 w-48 bg-card' />
          <Skeleton className='h-96 w-full bg-card rounded-lg' />
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className='min-h-screen bg-background p-6'>
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className='mb-6 text-muted-foreground hover:text-foreground'
        >
          <ArrowLeft className='w-4 h-4 mr-2' />
          Back
        </Button>
        <div className='text-center py-12'>
          <p className='text-muted-foreground text-lg mb-4'>{error || 'Employee not found'}</p>
          <Button onClick={() => router.push('/employees')}>
            Return to Employees
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='p-6'>
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className='mb-6 text-muted-foreground hover:text-foreground'
        >
          <ArrowLeft className='w-4 h-4 mr-2' />
          Back
        </Button>
      </div>
      <EmployeeProfile employee={employee} />
    </div>
  );
}
