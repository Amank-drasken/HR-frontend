'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Loader, Lock, Mail, ChevronRight } from 'lucide-react';
import { loginUser } from '@/lib/auth';
import { useAuthStore } from '@/lib/store';
import { autoCheckIn } from '@/lib/attendanceAuto';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setToken } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });



  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await loginUser(data.email, data.password);
      setToken(response.access_token);

      // Auto check-in after successful login
      const userId = localStorage.getItem('user_id');
      if (userId) {
        await autoCheckIn(userId);
      }

      // Small delay to ensure state is updated
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden'>
      {/* Animated background elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse'></div>
        <div className='absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse' style={{ animationDelay: '2s' }}></div>
        <div className='absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse' style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main content */}
      <div className='relative z-10 w-full max-w-md'>
        {/* Top accent */}
        <div className='mb-8 text-center'>
          <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg mb-4 animate-bounce'>
            <Lock className='w-8 h-8 text-white' />
          </div>
        </div>

        {/* Card */}
        <div className='bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden'>
          <div className='p-8 sm:p-10'>
            {/* Header */}
            <div className='text-center mb-8'>
              <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2'>
                HR Portal
              </h1>
              <p className='text-slate-400 text-sm'>Secure access to your workspace</p>

            </div>

            {/* Error message */}
            {error && (
              <div className='mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3 animate-in'>
                <AlertCircle className='w-5 h-5 text-red-400 mt-0.5 flex-shrink-0' />
                <p className='text-sm text-red-300'>{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              {/* Email field */}
              <div className='group'>
                <label className='block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2'>
                  <Mail className='w-4 h-4 text-blue-400' />
                  Email Address
                </label>
                <div className='relative'>
                  <Input
                    type='email'
                    placeholder='admin@example.com'
                    {...register('email')}
                    className='w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all'
                  />
                </div>
                {errors.email && (
                  <p className='mt-2 text-xs text-red-400 flex items-center gap-1'>
                    <span className='w-1 h-1 bg-red-400 rounded-full'></span>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password field */}
              <div className='group'>
                <label className='block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2'>
                  <Lock className='w-4 h-4 text-blue-400' />
                  Password
                </label>
                <div className='relative'>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder='••••••••••'
                    {...register('password')}
                    className='w-full bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-500 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 focus:bg-slate-700 focus:ring-2 focus:ring-blue-500/20 transition-all'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors text-lg'
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                {errors.password && (
                  <p className='mt-2 text-xs text-red-400 flex items-center gap-1'>
                    <span className='w-1 h-1 bg-red-400 rounded-full'></span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit button */}
              <Button
                type='submit'
                disabled={isLoading}
                className='w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2'
              >
                {isLoading ? (
                  <>
                    <Loader className='w-4 h-4 animate-spin' />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ChevronRight className='w-4 h-4' />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className='mt-8 pt-8 border-t border-slate-700/50'>
              {/* Footer info */}
              <p className='text-center text-xs text-slate-500'>
                By signing in, you agree to our Terms of Service
              </p>
            </div>
          </div>
        </div>

        {/* Bottom accent */}
        <div className='mt-6 text-center text-xs text-slate-500'>
          <p>Need help? Contact your administrator</p>
        </div>
      </div>
    </div>
  );
}
