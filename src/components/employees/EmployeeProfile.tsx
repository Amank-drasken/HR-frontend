'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Edit, Download } from 'lucide-react';

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

interface EmployeeProfileProps {
  employee: Employee;
}

export default function EmployeeProfile({ employee }: EmployeeProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const firstInitial = employee.firstName?.trim()?.[0] || '?';
  const lastInitial = employee.lastName?.trim()?.[0] || '';

  const calculateYearsOfService = (joiningDate: string | undefined) => {
    if (!joiningDate) return { years: 0, months: 0, days: 0 };
    const joining = new Date(joiningDate);
    const today = new Date();
    
    let years = today.getFullYear() - joining.getFullYear();
    let months = today.getMonth() - joining.getMonth();
    let days = today.getDate() - joining.getDate();

    if (days < 0) {
      months--;
      days += 30;
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    return { years, months, days };
  };

  const service = calculateYearsOfService(employee.dateOfJoining);

  return (
    <div className='min-h-screen bg-background p-6'>
      {/* Top Bar */}
      <div className='flex items-center justify-between mb-8'>
        <h1 className='text-3xl font-bold text-foreground'>Employee Profile</h1>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          variant="secondary"
          className='flex items-center gap-2'
        >
          <Edit className='w-4 h-4' />
          {isEditing ? 'Done' : 'Edit'}
        </Button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        {/* LEFT SIDEBAR - PROFILE CARD */}
        <div className='lg:col-span-1'>
          <Card className='p-6 text-center sticky top-6'>
            {/* Avatar */}
            <div className='flex justify-center mb-4'>
              <div className='w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center'>
                <Avatar className='w-full h-full'>
                  <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-400 text-white text-3xl font-bold'>
                    {firstInitial}{lastInitial}
                  </div>
                </Avatar>
              </div>
            </div>

            {/* Name */}
            <h2 className='text-2xl font-bold text-foreground mb-1'>
              {employee.firstName} {employee.lastName}
            </h2>
            <p className='text-muted-foreground mb-4'>{employee.designation}</p>

            {/* Service Duration */}
            <div className='border-t border-border pt-4 mb-4'>
              <p className='text-sm text-muted-foreground mb-1'>At work for</p>
              <p className='font-semibold text-foreground'>
                {service.years} year{service.years !== 1 ? 's' : ''} {service.months} month{service.months !== 1 ? 's' : ''} {service.days} day{service.days !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Stats */}
            <div className='grid grid-cols-3 gap-2'>
              <div className='bg-muted rounded-lg p-3'>
                <p className='text-lg font-bold text-primary'>0.03</p>
                <p className='text-xs text-muted-foreground'>Attendance</p>
              </div>
              <div className='bg-muted rounded-lg p-3'>
                <p className='text-lg font-bold text-blue-500'>0/10</p>
                <p className='text-xs text-muted-foreground'>Leave</p>
              </div>
              <div className='bg-muted rounded-lg p-3'>
                <p className='text-lg font-bold text-orange-500'>0</p>
                <p className='text-xs text-muted-foreground'>Awards</p>
              </div>
            </div>
          </Card>
        </div>

        {/* CENTER + RIGHT - MAIN CONTENT */}
        <div className='lg:col-span-3 space-y-6'>
          {/* PERSONAL DETAILS */}
          <Card className='p-6'>
            <div className='flex items-center gap-2 mb-6 pb-4 border-b border-border'>
              <div className='w-4 h-4 rounded bg-green-500'></div>
              <h3 className='text-lg font-semibold text-foreground'>Personal Details</h3>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>Name</p>
                <p className='font-semibold text-foreground'>{employee.firstName} {employee.lastName}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>Father's Name</p>
                <p className='font-semibold text-foreground'>{employee.fatherName || '—'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>DOB</p>
                <p className='font-semibold text-foreground'>{employee.dob || '—'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>Gender</p>
                <p className='font-semibold text-foreground'>{employee.gender || '—'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>Email</p>
                <p className='font-semibold text-foreground'>{employee.email}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>Phone</p>
                <p className='font-semibold text-foreground'>{employee.phone}</p>
              </div>
              <div className='md:col-span-2'>
                <p className='text-sm text-muted-foreground mb-1'>Local Address</p>
                <p className='font-semibold text-foreground'>{employee.localAddress || '—'}</p>
              </div>
              <div className='md:col-span-2'>
                <p className='text-sm text-muted-foreground mb-1'>Permanent Address</p>
                <p className='font-semibold text-foreground'>{employee.permanentAddress || '—'}</p>
              </div>
            </div>
          </Card>

          {/* COMPANY DETAILS */}
          <Card className='p-6'>
            <div className='flex items-center gap-2 mb-6 pb-4 border-b border-border'>
              <div className='w-4 h-4 rounded bg-green-500'></div>
              <h3 className='text-lg font-semibold text-foreground'>Company Details</h3>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>Employee ID</p>
                <p className='font-semibold text-foreground'>{employee.id}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>Department</p>
                <p className='font-semibold text-foreground'>{employee.department}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>Designation</p>
                <p className='font-semibold text-foreground'>{employee.designation}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>Date of Joining</p>
                <p className='font-semibold text-foreground'>{employee.dateOfJoining || '—'}</p>
              </div>
              <div className='md:col-span-2'>
                <p className='text-sm text-muted-foreground mb-1'>Salary (₹ INR)</p>
                <p className='font-semibold text-foreground'>{employee.salary || '—'}</p>
              </div>
            </div>
          </Card>

          {/* BANK DETAILS */}
          <Card className='p-6'>
            <div className='flex items-center gap-2 mb-6 pb-4 border-b border-border'>
              <div className='w-4 h-4 rounded bg-green-500'></div>
              <h3 className='text-lg font-semibold text-foreground'>Bank Details</h3>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>Account Holder Name</p>
                <p className='font-semibold text-foreground'>{employee.bankAccountHolder || '—'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>Account Number</p>
                <p className='font-semibold text-foreground'>{employee.bankAccountNumber || '—'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>Bank Name</p>
                <p className='font-semibold text-foreground'>{employee.bankName || '—'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>PAN Number</p>
                <p className='font-semibold text-foreground'>{employee.panNumber || '—'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>IFSC Code</p>
                <p className='font-semibold text-foreground'>{employee.ifscCode || '—'}</p>
              </div>
              <div>
                <p className='text-sm text-muted-foreground mb-1'>Branch</p>
                <p className='font-semibold text-foreground'>{employee.branch || '—'}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
