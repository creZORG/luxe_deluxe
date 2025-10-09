'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingModal } from '@/components/ui/loading-modal';

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || !['sales', 'admin', 'developer'].includes(user.role)) {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <LoadingModal />;
  }
  
  if (!['sales', 'admin', 'developer'].includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}
