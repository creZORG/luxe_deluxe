
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SalesPortalPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'sales' && user.role !== 'admin'))) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-12">
        <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold">Sales Portal</h1>
            <p className="text-lg text-muted-foreground">Welcome, {user.name}!</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Your Sales Dashboard is Coming Soon!</CardTitle>
                <CardDescription>
                    This is where you'll be able to place orders for customers,
                    track your performance, and view your commissions.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>We're building powerful tools to help you succeed.</p>
            </CardContent>
        </Card>
    </div>
  );
}
