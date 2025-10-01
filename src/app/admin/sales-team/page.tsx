
'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function SalesTeamPage() {
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
