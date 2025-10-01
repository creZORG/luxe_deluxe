
'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function InfluencersPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Influencers</h1>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Coming Soon!</CardTitle>
            <CardDescription>
                This section will allow you to manage your influencers, generate referral links,
                create promo codes, and track their performance.
            </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
