'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    api.get('/auth/me')
    .then(data => {
      if (data.role === 'recruiter' || data.role === 'admin') {
        router.push('/recruiter');
      } else {
        router.push('/candidate/dashboard');
      }
    })
    .catch(() => {
      // API wrapper handles 401 redirects automatically
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
