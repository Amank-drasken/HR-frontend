'use client';

import { useState, useEffect } from 'react';
import EmployeeProfile from '@/components/employees/EmployeeProfile';
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

export default function MyProfilePage() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProfile = () => {
      try {
        // Get employee data from localStorage
        const userData = localStorage.getItem('user_data');
        const userId = localStorage.getItem('user_id');
        
        if (userData) {
          const parsedData = JSON.parse(userData);
          setEmployee({
            id: userId || parsedData.id || '',
            firstName: parsedData.firstName || 'Employee',
            lastName: parsedData.lastName || 'Name',
            email: parsedData.email || '',
            phone: parsedData.phone || '',
            department: parsedData.department || 'N/A',
            designation: parsedData.designation || 'Employee',
            dob: parsedData.dob || '',
            gender: parsedData.gender || '',
            fatherName: parsedData.fatherName || '',
            localAddress: parsedData.localAddress || '',
            permanentAddress: parsedData.permanentAddress || '',
            dateOfJoining: parsedData.dateOfJoining || '',
            salary: parsedData.salary || '',
            bankAccountHolder: parsedData.bankAccountHolder || '',
            bankAccountNumber: parsedData.bankAccountNumber || '',
            bankName: parsedData.bankName || '',
            panNumber: parsedData.panNumber || '',
            ifscCode: parsedData.ifscCode || '',
            branch: parsedData.branch || '',
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
      } finally {
        setIsLoading(false);
      }
    };

    // Simulate small delay
    const timer = setTimeout(loadProfile, 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-background p-6'>
        <Skeleton className='h-10 w-40 mb-6' />
        <div className='grid grid-cols-4 gap-6'>
          <Skeleton className='col-span-1 h-96 rounded-2xl' />
          <div className='col-span-3 space-y-6'>
            <Skeleton className='h-64 rounded-2xl' />
            <Skeleton className='h-64 rounded-2xl' />
          </div>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className='min-h-screen bg-background p-6 flex items-center justify-center'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-foreground mb-2'>Profile Not Found</h2>
          <p className='text-muted-foreground'>Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  return <EmployeeProfile employee={employee} />;
}
