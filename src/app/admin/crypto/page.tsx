
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CryptoPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'admin' && user.role !== 'developer'))) {
      router.push('/admin/dashboard');
    }
  }, [user, loading, router]);


  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Crypto Management</h1>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>STRAD Points Dashboard</CardTitle>
            <CardDescription>
                This section will allow you to manage the STRAD points ecosystem.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Stage 1 Complete: Foundational data structures are in place.</p>
            <p className="mt-4">Coming in Stage 2 & 3:</p>
            <ul className="list-disc list-inside mt-2 text-muted-foreground">
                <li>User-facing profile section to view points and referral codes.</li>
                <li>Secure email verification (OTP) to award points for new signups.</li>
                <li>A full developer dashboard to view system-wide stats.</li>
                <li>Global settings to configure points awards.</li>
            </ul>
        </CardContent>
      </Card>
    </div>
  );
}
