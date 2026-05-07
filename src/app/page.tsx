'use client';

export default function Home() {
  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-50'>
      <div className='text-center'>
        <h1 className='text-2xl font-bold text-gray-900 mb-4'>DRASKEN HRMS</h1>
        <p className='text-gray-600'>Redirecting...</p>
        <script>
          {`
            if (typeof window !== 'undefined') {
              setTimeout(() => {
                const token = localStorage.getItem('access_token');
                if (token) {
                  window.location.href = '/dashboard';
                } else {
                  window.location.href = '/login';
                }
              }, 500);
            }
          `}
        </script>
      </div>
    </div>
  );
}

