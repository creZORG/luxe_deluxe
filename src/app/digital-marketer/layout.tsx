'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoadingModal } from '@/components/ui/loading-modal';

export default function DigitalMarketerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || (user.role !== 'digital_marketer' && user.role !== 'admin')) {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <LoadingModal />;
  }
  
  if (user.role !== 'digital_marketer' && user.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
