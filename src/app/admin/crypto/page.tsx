
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth, type User } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Loader2, Star, Users } from 'lucide-react';

type CryptoStats = {
  totalPointsInCirculation: number;
  totalReferrals: number;
};

export default function CryptoPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<CryptoStats>({ totalPointsInCirculation: 0, totalReferrals: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'admin' && user.role !== 'developer'))) {
      router.push('/admin/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let totalPoints = 0;
      let totalRefs = 0;
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as User;
        totalPoints += userData.stradPoints || 0;
        totalRefs += (userData.successfulReferrals || []).length;
      });
      setStats({
        totalPointsInCirculation: totalPoints,
        totalReferrals: totalRefs,
      });
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Crypto Management</h1>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>STRAD Points Ecosystem</CardTitle>
            <CardDescription>
                A high-level overview of the points system.
            </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Points in Circulation</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPointsInCirculation.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Across all users</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Successful Referrals</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalReferrals.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Number of users who signed up via referral</p>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
        <CardContent>
          <div className="mt-4 bg-muted p-4 rounded-md">
            <h4 className="font-semibold">Coming in the next phases:</h4>
             <ul className="list-disc list-inside mt-2 text-muted-foreground text-sm">
                <li>System to flag suspicious activities.</li>
                <li>Tools to reset or revert points for individual users.</li>
                <li>A detailed audit log for all point transactions.</li>
                <li>Leaderboards for top referrers and earners.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
