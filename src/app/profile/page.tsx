
'use client';

import { useAuth, type ShippingAddress } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { sendVerificationEmail, verifyUserEmail } from '@/app/actions';
import { updateUserShippingAddress } from '@/app/admin/users/actions';
import { Loader2, Star, Copy, Info } from 'lucide-react';
import type { Order, OrderStatus } from '@/lib/admin';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { Label } from '@/components/ui/label';
import Link from 'next/link';


// Helper function to safely convert a Firestore Timestamp or a JS Date to a JS Date
const toJavaScriptDate = (date: any): Date | null => {
  if (!date) return null;
  if (date instanceof Timestamp) return date.toDate();
  if (date.toDate) return date.toDate(); // It's a Firestore Timestamp
  if (date instanceof Date) return date; // It's already a JS Date
  return null; // Or handle as an error
};

const shippingSchema = z.object({
  phone: z.string().min(10, { message: 'A valid phone number is required.' }),
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  address: z.string().min(1, { message: 'Address is required.' }),
  city: z.string().min(1, { message: 'City is required.' }),
  county: z.string().min(1, { message: 'County is required.' }),
  deliveryDescription: z.string().optional(),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

function ShippingAddressForm() {
    const { user } = useAuth();
    const [isPending, startTransition] = useTransition();

    const form = useForm<ShippingFormValues>({
        resolver: zodResolver(shippingSchema),
        defaultValues: {
            phone: '',
            firstName: '',
            lastName: '',
            address: '',
            city: '',
            county: '',
            deliveryDescription: '',
        },
    });
    
    useEffect(() => {
        if (user?.shippingAddress) {
            form.reset(user.shippingAddress);
        } else if (user) {
            const nameParts = user.name.split(' ');
            form.reset({
                ...form.getValues(),
                firstName: nameParts[0] || '',
                lastName: nameParts.slice(1).join(' ') || '',
            });
        }
    }, [user, form]);

    const onSubmit: SubmitHandler<ShippingFormValues> = (data) => {
        if (!user) return;
        startTransition(async () => {
            const result = await updateUserShippingAddress(user.uid, data);
            if (result.success) {
                toast({ title: 'Address Saved', description: 'Your shipping information has been updated.'});
                // The user object in useAuth will be updated via revalidation, no need to manually set it
            } else {
                toast({ title: 'Error', description: result.error, variant: 'destructive' });
            }
        });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </div>
                        <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="0712 345 678" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="address" render={({ field }) => ( <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="e.g. Street, Estate, Building, Apt No." {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="city" render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="county" render={({ field }) => ( <FormItem><FormLabel>County</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                    </div>
                        <FormField control={form.control} name="deliveryDescription" render={({ field }) => ( <FormItem><FormLabel>Delivery Instructions (Optional)</FormLabel><FormControl><Textarea placeholder="e.g., Leave at the reception, call upon arrival." {...field} /></FormControl><FormMessage /></FormItem> )} />
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Address
                    </Button>
                </CardFooter>
            </form>
        </Form>
    )
}

function OrderHistory() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<OrderStatus | 'All'>('All');

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        };

        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where("userId", "==", user.uid), orderBy('orderDate', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const userOrders = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    orderDate: data.orderDate
                } as Order;
            });
            setOrders(userOrders);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching orders:", error);
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [user]);

     const filteredOrders = useMemo(() => {
        if (activeTab === 'All') return orders;
        return orders.filter(order => order.status === activeTab);
    }, [orders, activeTab]);

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading orders...</TableCell></TableRow>
                    ) : filteredOrders.length > 0 ? (
                        filteredOrders.map(order => {
                            const orderDate = toJavaScriptDate(order.orderDate);
                            return (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">{order.reference}</TableCell>
                                <TableCell>{orderDate ? format(orderDate, 'PPp') : 'N/A'}</TableCell>
                                <TableCell>KES {order.subtotal.toFixed(2)}</TableCell>
                                <TableCell><Badge>{order.status}</Badge></TableCell>
                            </TableRow>
                        )})
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">No orders found for this status.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            </div>
    );
}

function EmailVerificationCard() {
    const { user } = useAuth();
    const [otp, setOtp] = useState('');
    const [isSending, startSending] = useTransition();
    const [isVerifying, startVerifying] = useTransition();

    const handleSendOtp = () => {
        if (!user?.email) return;
        startSending(async () => {
            const result = await sendVerificationEmail(user.email, user.name);
            if (result.success) {
                toast({ title: 'OTP Sent', description: 'A verification code has been sent to your email.'});
            } else {
                 toast({ title: 'Error', description: result.error, variant: 'destructive'});
            }
        });
    }

    const handleVerifyOtp = () => {
        if (!user?.email) return;
         startVerifying(async () => {
            const result = await verifyUserEmail(user.uid, user.email, otp);
            if (result.success) {
                toast({ title: 'Email Verified!', description: 'Your account is now verified and points have been awarded.'});
                // No need to manually update user state, revalidation will handle it
            } else {
                toast({ title: 'Invalid OTP', description: result.error, variant: 'destructive'});
            }
        });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Verify Your Email</CardTitle>
                <CardDescription>Enter the 6-digit code sent to your email to verify your account and start earning points.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-2">
                    <Input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" maxLength={6} disabled={isVerifying}/>
                    <Button onClick={handleVerifyOtp} disabled={isVerifying || isSending || otp.length !== 6}>
                        {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Verify
                    </Button>
                </div>
            </CardContent>
            <CardFooter>
                 <Button variant="link" className="p-0 h-auto" onClick={handleSendOtp} disabled={isSending || isVerifying}>
                    {isSending ? 'Sending...' : "Didn't receive a code? Resend."}
                </Button>
            </CardFooter>
        </Card>
    );
}


export default function ProfilePage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
        setBaseUrl(window.location.origin);
    }
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const getInitials = (name = '') => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  };

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const referralLink = `${baseUrl}/signup?ref=${user.referralCode}`;

  return (
    <div className="container mx-auto max-w-4xl py-12 space-y-8">
        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarFallback className="text-4xl">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-3xl font-bold">{user.name}</h1>
                        <p className="text-lg text-muted-foreground">{user.email}</p>
                        <Button variant="link" onClick={logout} className="px-0 h-auto text-muted-foreground">Log out</Button>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                             <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                             <p className="text-4xl font-bold">{user.stradPoints || 0}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-muted-foreground">$TRAD Points</p>
                            <Link href="/campaigns/trad">
                                <Info className="h-4 w-4 text-muted-foreground hover:text-primary cursor-pointer" />
                            </Link>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
        
        {!user.emailVerified && <EmailVerificationCard />}

        <Card>
            <CardHeader>
                <CardTitle>Refer & Earn</CardTitle>
                <CardDescription>Share your code and earn $TRAD Points for every friend who signs up and verifies their email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Your Referral Code</Label>
                    <div className="flex gap-2">
                        <Input value={user.referralCode} readOnly className="font-mono"/>
                        <Button variant="outline" size="icon" onClick={() => copyToClipboard(user.referralCode)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Your Referral Link</Label>
                    <div className="flex gap-2">
                        <Input value={referralLink} readOnly className="text-sm"/>
                         <Button variant="outline" size="icon" onClick={() => copyToClipboard(referralLink)}>
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
      
      <Tabs defaultValue="orders">
        <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="shipping">Shipping Info</TabsTrigger>
        </TabsList>
        <TabsContent value="orders">
            <Card>
                <CardHeader>
                    <CardTitle>My Orders</CardTitle>
                    <CardDescription>View your complete order history.</CardDescription>
                </CardHeader>
                <CardContent>
                    <OrderHistory />
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="shipping">
             <Card>
                <CardHeader>
                    <CardTitle>Shipping Information</CardTitle>
                    <CardDescription>Manage your default shipping address for faster checkout.</CardDescription>
                </CardHeader>
                <ShippingAddressForm />
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
