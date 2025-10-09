'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { getAllUsers, type User } from '@/lib/admin';
import { createInfluencerCampaign, getCampaignsByInfluencerId, type InfluencerCampaign } from '@/lib/marketing';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Search, Percent } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


const campaignSchema = z.object({
    influencerId: z.string().min(1, 'You must select an influencer.'),
    promoCode: z.string().min(3, 'Promo code must be at least 3 characters.').max(20).toUpperCase(),
    commissionRate: z.number().min(0, 'Commission cannot be negative.').max(100, 'Commission cannot exceed 100%.'),
});
type CampaignFormValues = z.infer<typeof campaignSchema>;

export default function InfluencersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedInfluencer, setSelectedInfluencer] = useState<User | null>(null);
    const [campaigns, setCampaigns] = useState<InfluencerCampaign[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingCampaigns, setLoadingCampaigns] = useState(false);
    const [isPending, startTransition] = useTransition();

    const form = useForm<CampaignFormValues>({
        resolver: zodResolver(campaignSchema),
        defaultValues: {
            influencerId: '',
            promoCode: '',
            commissionRate: 10,
        },
    });

    useEffect(() => {
        async function loadUsers() {
            setLoadingUsers(true);
            const allUsers = await getAllUsers();
            setUsers(allUsers);
            setLoadingUsers(false);
        }
        loadUsers();
    }, []);

    useEffect(() => {
        async function loadCampaigns() {
            if (selectedInfluencer) {
                setLoadingCampaigns(true);
                const influencerCampaigns = await getCampaignsByInfluencerId(selectedInfluencer.uid);
                setCampaigns(influencerCampaigns);
                setLoadingCampaigns(false);
            } else {
                setCampaigns([]);
            }
        }
        loadCampaigns();
    }, [selectedInfluencer]);

    const handleSelectInfluencer = (user: User) => {
        setSelectedInfluencer(user);
        form.setValue('influencerId', user.uid);
    }
    
    const onSubmit: SubmitHandler<CampaignFormValues> = (data) => {
        if (!selectedInfluencer) return;
        startTransition(async () => {
            const result = await createInfluencerCampaign({
                ...data,
                influencerName: selectedInfluencer.name,
                influencerEmail: selectedInfluencer.email || '',
            });
            if (result.success) {
                toast({ title: 'Campaign Created', description: `A new campaign for ${selectedInfluencer.name} has been created.`});
                form.reset({ ...form.getValues(), promoCode: '', commissionRate: 10 });
                // Refetch campaigns
                const influencerCampaigns = await getCampaignsByInfluencerId(selectedInfluencer.uid);
                setCampaigns(influencerCampaigns);
            } else {
                toast({ title: 'Error', description: result.error, variant: 'destructive' });
            }
        });
    }

    const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Influencer Management</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Create a New Campaign</CardTitle>
                    <CardDescription>Select an influencer and create a unique promo code for them.</CardDescription>
                </CardHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="influencerId"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>1. Select Influencer</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" role="combobox" className="w-full justify-between">
                                                        {selectedInfluencer ? (
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-6 w-6">
                                                                    <AvatarFallback>{getInitials(selectedInfluencer.name)}</AvatarFallback>
                                                                </Avatar>
                                                                {selectedInfluencer.name}
                                                            </div>
                                                        ) : "Select an influencer..."}
                                                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search users..." />
                                                    <CommandList>
                                                        <CommandEmpty>No user found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {users.map((user) => (
                                                                <CommandItem
                                                                    value={user.email || user.name}
                                                                    key={user.uid}
                                                                    onSelect={() => handleSelectInfluencer(user)}
                                                                >
                                                                    {user.name} ({user.email})
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            {selectedInfluencer && (
                                <div className="space-y-4 pt-4 border-t">
                                     <FormLabel>2. Campaign Details</FormLabel>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="promoCode" render={({ field }) => (<FormItem><FormLabel>Promo Code</FormLabel><FormControl><Input placeholder="e.g. LUNA20" {...field} onChange={e => field.onChange(e.target.value.toUpperCase())} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="commissionRate" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Commission Rate (%)</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                         <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} className="pl-8" />
                                                         <Percent className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                </div>
                            )}

                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isPending || !selectedInfluencer}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Campaign
                            </Button>
                        </CardFooter>
                    </form>
                </Form>
            </Card>

            {selectedInfluencer && (
                 <Card>
                    <CardHeader>
                        <CardTitle>Campaigns for {selectedInfluencer.name}</CardTitle>
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
                                        <TableHead>Earnings</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Created</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loadingCampaigns ? (
                                        <TableRow><TableCell colSpan={7} className="text-center">Loading campaigns...</TableCell></TableRow>
                                    ) : campaigns.length > 0 ? (
                                        campaigns.map(campaign => (
                                            <TableRow key={campaign.id}>
                                                <TableCell className="font-mono">{campaign.promoCode}</TableCell>
                                                <TableCell>{campaign.commissionRate}%</TableCell>
                                                <TableCell>{campaign.timesUsed}</TableCell>
                                                <TableCell>KES {campaign.revenueGenerated.toFixed(2)}</TableCell>
                                                <TableCell>KES {(campaign.revenueGenerated * (campaign.commissionRate / 100)).toFixed(2)}</TableCell>
                                                <TableCell><Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>{campaign.status}</Badge></TableCell>
                                                <TableCell>{format(campaign.createdAt.toDate(), 'PPP')}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow><TableCell colSpan={7} className="text-center h-24">No campaigns found for this influencer.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
