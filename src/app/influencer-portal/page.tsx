'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getCampaignsByInfluencerId, acceptInfluencerCampaign, type InfluencerCampaign } from '@/lib/marketing';
import { Loader2, CheckCircle, Gift, Copy, BarChart2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

function CampaignCard({ campaign, onAccept }: { campaign: InfluencerCampaign, onAccept: (id: string) => void }) {
    const [isAccepting, startAccepting] = useTransition();

    const handleAccept = () => {
        startAccepting(() => {
            onAccept(campaign.id);
        });
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied to clipboard!' });
    };

    return (
        <Card className={campaign.status === 'pending' ? 'bg-primary/5 border-primary' : ''}>
            <CardHeader>
                <CardTitle>Campaign: {campaign.promoCode}</CardTitle>
                <CardDescription>
                    You've been invited to a new campaign with a <strong>{campaign.commissionRate}% commission rate</strong>.
                </CardDescription>
            </CardHeader>
            {campaign.status === 'active' && (
                 <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">Share this code with your audience to start earning.</p>
                     <div className="flex gap-2">
                        <input value={campaign.promoCode} readOnly className="font-mono w-full px-3 py-2 border rounded-md bg-muted"/>
                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(campaign.promoCode)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                 </CardContent>
            )}
            <CardFooter>
                {campaign.status === 'pending' && (
                    <Button onClick={handleAccept} disabled={isAccepting}>
                        {isAccepting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Accept Campaign
                    </Button>
                )}
                 {campaign.status === 'active' && (
                    <Badge variant="default">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Active
                    </Badge>
                )}
            </CardFooter>
        </Card>
    );
}

export default function InfluencerPortalPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<InfluencerCampaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  useEffect(() => {
    if (!loading && (!user || (user.role !== 'influencer' && user.role !== 'admin'))) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  const fetchCampaigns = async () => {
     if (!user) return;
      setLoadingCampaigns(true);
      const influencerCampaigns = await getCampaignsByInfluencerId(user.uid);
      setCampaigns(influencerCampaigns);
      setLoadingCampaigns(false);
  }

  useEffect(() => {
    fetchCampaigns();
  }, [user]);

  const handleAcceptCampaign = async (campaignId: string) => {
    const result = await acceptInfluencerCampaign(campaignId);
    if (result.success) {
      toast({ title: 'Campaign Accepted!', description: 'You can now share your promo code.'});
      fetchCampaigns(); // Refresh the list
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive'});
    }
  }

  const pendingCampaigns = campaigns.filter(c => c.status === 'pending');
  const activeCampaigns = campaigns.filter(c => c.status === 'active');


  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-12 space-y-8">
        <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold">Influencer Portal</h1>
            <p className="text-lg text-muted-foreground">Welcome, {user.name}!</p>
        </div>
        
        {loadingCampaigns ? (
            <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
            <>
                {pendingCampaigns.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold flex items-center gap-2"><Gift /> New Campaign Invitations</h2>
                        {pendingCampaigns.map(campaign => (
                            <CampaignCard key={campaign.id} campaign={campaign} onAccept={handleAcceptCampaign} />
                        ))}
                    </div>
                )}

                {activeCampaigns.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><BarChart2/> Your Active Campaigns</CardTitle>
                            <CardDescription>Track the performance of your promo codes here.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="w-full border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Promo Code</TableHead>
                                            <TableHead>Commission</TableHead>
                                            <TableHead>Uses</TableHead>
                                            <TableHead>Revenue</TableHead>
                                            <TableHead>Your Earnings</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {activeCampaigns.map(campaign => (
                                            <TableRow key={campaign.id}>
                                                <TableCell className="font-mono">{campaign.promoCode}</TableCell>
                                                <TableCell>{campaign.commissionRate}%</TableCell>
                                                <TableCell>{campaign.timesUsed}</TableCell>
                                                <TableCell>KES {campaign.revenueGenerated.toFixed(2)}</TableCell>
                                                <TableCell className="font-semibold">KES {(campaign.revenueGenerated * (campaign.commissionRate / 100)).toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {campaigns.length === 0 && (
                    <Card className="text-center py-12">
                        <CardHeader>
                            <CardTitle>No Campaigns Yet</CardTitle>
                            <CardDescription>
                                There are no campaigns assigned to you at the moment.
                                Check back soon!
                            </CardDescription>
                        </CardHeader>
                    </Card>
                )}
            </>
        )}
    </div>
  );
}
