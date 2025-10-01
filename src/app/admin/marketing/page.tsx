
'use client';

import { useState, useEffect, useTransition } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { createPromoCode } from './actions';
import { getAllPromoCodes, PromoCode } from '@/lib/marketing';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Link as LinkIcon, ClipboardCopy } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const promoCodeSchema = z.object({
    code: z.string().min(3, 'Code must be at least 3 characters long.').max(20, 'Code must be 20 characters or less.'),
    discountType: z.enum(['percentage', 'fixed']),
    discountValue: z.number().min(0, 'Discount value must be positive.'),
    expiryDate: z.date().optional(),
    usageLimit: z.number().min(0, 'Usage limit must be a positive number.').optional(),
});
type PromoCodeFormValues = z.infer<typeof promoCodeSchema>;

function CreatePromoCodeForm({ onCodeCreated }: { onCodeCreated: () => void }) {
    const [isPending, startTransition] = useTransition();

    const form = useForm<PromoCodeFormValues>({
        resolver: zodResolver(promoCodeSchema),
        defaultValues: {
            code: '',
            discountType: 'percentage',
            discountValue: 10,
        },
    });

    const onSubmit: SubmitHandler<PromoCodeFormValues> = (data) => {
        startTransition(async () => {
            const result = await createPromoCode(data);
            if (result.success) {
                toast({ title: "Promo Code Created", description: `Code "${data.code}" has been successfully created.` });
                form.reset();
                onCodeCreated();
            } else {
                toast({ title: "Error", description: result.error, variant: 'destructive' });
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="code" render={({ field }) => (<FormItem><FormLabel>Promo Code</FormLabel><FormControl><Input placeholder="e.g. SUMMER10" {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name="expiryDate" render={({ field }) => (
                        <FormItem className="flex flex-col"><FormLabel>Expiry Date (Optional)</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                 <div className="grid md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="discountType" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Discount Type</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger><SelectValue placeholder="Select discount type" /></SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                    <SelectItem value="fixed">Fixed Amount (KES)</SelectItem>
                                </SelectContent>
                             </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="discountValue" render={({ field }) => (<FormItem><FormLabel>Discount Value</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />
                </div>
                 <FormField control={form.control} name="usageLimit" render={({ field }) => (<FormItem><FormLabel>Usage Limit (Optional)</FormLabel><FormControl><Input type="number" placeholder="e.g., 100" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} /></FormControl><FormMessage /></FormItem>)} />

                <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Code
                </Button>
            </form>
        </Form>
    )
}

function TrackingLinkForm() {
    const [baseUrl, setBaseUrl] = useState('https://');
    const [utmSource, setUtmSource] = useState('');
    const [utmMedium, setUtmMedium] = useState('');
    const [utmCampaign, setUtmCampaign] = useState('');
    const [generatedUrl, setGeneratedUrl] = useState('');

    useEffect(() => {
        setBaseUrl(window.location.origin);
    }, []);

    const generateUrl = () => {
        try {
            const url = new URL(baseUrl);
            if (utmSource) url.searchParams.set('utm_source', utmSource);
            if (utmMedium) url.searchParams.set('utm_medium', utmMedium);
            if (utmCampaign) url.searchParams.set('utm_campaign', utmCampaign);
            setGeneratedUrl(url.toString());
        } catch (e) {
            toast({ title: 'Invalid Base URL', variant: 'destructive' });
        }
    };
    
    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedUrl);
        toast({ title: 'Copied to clipboard!' });
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="base-url">Base URL</Label>
                <Input id="base-url" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="utm-source">UTM Source</Label>
                    <Input id="utm-source" placeholder="e.g. instagram" value={utmSource} onChange={(e) => setUtmSource(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="utm-medium">UTM Medium</Label>
                    <Input id="utm-medium" placeholder="e.g. social" value={utmMedium} onChange={(e) => setUtmMedium(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="utm-campaign">UTM Campaign</Label>
                    <Input id="utm-campaign" placeholder="e.g. summer_sale" value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)} />
                </div>
            </div>
             <Button onClick={generateUrl}>
                <LinkIcon className="mr-2 h-4 w-4" />
                Generate Tracking Link
            </Button>

            {generatedUrl && (
                <Card className="bg-muted">
                    <CardContent className="p-4 flex items-center justify-between">
                        <p className="text-sm font-mono break-all">{generatedUrl}</p>
                        <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                            <ClipboardCopy className="h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function MarketingPage() {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPromoCodes = async () => {
        setLoading(true);
        const codes = await getAllPromoCodes();
        setPromoCodes(codes);
        setLoading(false);
    };

    useEffect(() => {
        fetchPromoCodes();
    }, []);

    const getStatus = (code: PromoCode) => {
        if (code.expiryDate && code.expiryDate.toDate() < new Date()) {
            return <Badge variant="destructive">Expired</Badge>;
        }
        if (code.usageLimit && code.timesUsed >= code.usageLimit) {
            return <Badge variant="secondary">Used Up</Badge>;
        }
        return <Badge variant="default">Active</Badge>;
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Marketing Tools</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Promo Code Management</CardTitle>
                    <CardDescription>Create and manage discount codes for your campaigns.</CardDescription>
                </CardHeader>
                <CardContent>
                    <CreatePromoCodeForm onCodeCreated={fetchPromoCodes} />
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-4">
                    <h3 className="text-lg font-semibold">Existing Promo Codes</h3>
                    <div className="w-full border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Discount</TableHead>
                                    <TableHead>Usage</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
                                ) : promoCodes.length > 0 ? (
                                    promoCodes.map(code => (
                                        <TableRow key={code.id}>
                                            <TableCell className="font-mono">{code.code}</TableCell>
                                            <TableCell>{code.discountType === 'percentage' ? `${code.discountValue}%` : `KES ${code.discountValue}`}</TableCell>
                                            <TableCell>{code.timesUsed} / {code.usageLimit || '∞'}</TableCell>
                                            <TableCell>{code.expiryDate ? format(code.expiryDate.toDate(), 'PPP') : 'Never'}</TableCell>
                                            <TableCell>{getStatus(code)}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={5} className="text-center h-24">No promo codes found.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Tracking Link Generator</CardTitle>
                    <CardDescription>Create URLs with UTM parameters to track the effectiveness of your campaigns.</CardDescription>
                </CardHeader>
                <CardContent>
                   <TrackingLinkForm />
                </CardContent>
            </Card>
        </div>
    );
}
