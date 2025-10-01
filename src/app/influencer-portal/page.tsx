
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function InfluencerPortalPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'influencer' && user.role !== 'admin'))) {
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
            <h1 className="text-4xl font-bold">Influencer Portal</h1>
            <p className="text-lg text-muted-foreground">Welcome, {user.name}!</p>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Your Dashboard is Coming Soon!</CardTitle>
                <CardDescription>
                    This is where you'll find your unique referral links, track your sales,
                    and see your earnings. Stay tuned!
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p>We're working hard to bring you a best-in-class experience.</p>
            </CardContent>
        </Card>
    </div>
  );
}
