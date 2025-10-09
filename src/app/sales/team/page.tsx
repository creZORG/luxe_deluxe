'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function SalesTeamPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user && !['admin', 'developer', 'sales'].includes(user.role)) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
      return (
          <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      )
  }

  if (!user || !['admin', 'developer', 'sales'].includes(user.role)) {
      return null;
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Sales Team</h1>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Coming Soon!</CardTitle>
            <CardDescription>
                This section will allow you to manage your sales team members and view
                their performance dashboards and leaderboards.
            </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
