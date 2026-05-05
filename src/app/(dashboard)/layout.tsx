'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import { Loader } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { initializeAuth } = useAuthStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    let token = localStorage.getItem('access_token');
    
    // If no token in localStorage, try to extract from cookie
    if (!token) {
      const cookieString = document.cookie;
      const cookieValue = cookieString.split(';').find(cookie => cookie.trim().startsWith('access_token='));
      if (cookieValue) {
        token = cookieValue.split('=')[1];
        console.warn('🍪 Found token in cookie, syncing to localStorage:', token?.substring(0, 20));
        if (token) {
          localStorage.setItem('access_token', token);
        }
      }
    }
    
    if (!token) {
      setIsAuthenticated(false);
      router.replace('/login');
      return;
    }

    initializeAuth();
    setIsAuthenticated(true);
  }, [initializeAuth, router]);

  // While checking auth, show loading
  if (isAuthenticated === null) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='flex flex-col items-center gap-2'>
          <Loader className='w-8 h-8 text-blue-600 animate-spin' />
          <p className='text-gray-600'>Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render (router is redirecting)
  if (!isAuthenticated) {
    return null;
  }

  // If authenticated, render dashboard
  return (
    <>
      <Navbar />
      <div className='flex'>
        <Sidebar />
        <main className='flex-1 bg-gray-50 min-h-screen'>{children}</main>
      </div>
    </>
  );
}
