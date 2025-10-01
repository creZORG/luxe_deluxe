
'use client';

import { useAuth, type ShippingAddress } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { updateUserShippingAddress } from '../actions';
import { Loader2, Star } from 'lucide-react';
import { getOrdersByUserId } from '@/lib/admin';
import type { Order, OrderStatus } from '@/lib/admin';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';


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
        <Card>
            <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
                <CardDescription>Manage your default shipping address for faster checkout.</CardDescription>
            </CardHeader>
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
        </Card>
    )
}

function OrderHistory() {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<OrderStatus | 'All'>('All');

    useEffect(() => {
        const fetchOrders = async () => {
            if (user) {
                setLoading(true);
                const userOrders = await getOrdersByUserId(user.uid);
                setOrders(userOrders);
                setLoading(false);
            }
        };
        fetchOrders();
    }, [user]);

     const filteredOrders = useMemo(() => {
        if (activeTab === 'All') return orders;
        return orders.filter(order => order.status === activeTab);
    }, [orders, activeTab]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Orders</CardTitle>
                <CardDescription>View your complete order history.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                    <TabsList className="mb-4 grid grid-cols-3 md:grid-cols-5 h-auto">
                        <TabsTrigger value="All">All</TabsTrigger>
                        <TabsTrigger value="Pending">Pending</TabsTrigger>
                        <TabsTrigger value="Shipped">Shipped</TabsTrigger>
                        <TabsTrigger value="Delivered">Delivered</TabsTrigger>
                        <TabsTrigger value="Cancelled">Cancelled</TabsTrigger>
                    </TabsList>
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
                                    filteredOrders.map(order => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.reference}</TableCell>
                                            <TableCell>{format(order.orderDate.toDate(), 'PPp')}</TableCell>
                                            <TableCell>KES {order.subtotal.toFixed(2)}</TableCell>
                                            <TableCell><Badge>{order.status}</Badge></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">No orders found for this status.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                     </div>
                </Tabs>
            </CardContent>
        </Card>
    );
}


export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const getInitials = (name = '') => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

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
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2">
                             <Star className="h-8 w-8 text-yellow-400 fill-yellow-400" />
                             <p className="text-4xl font-bold">{user.loyaltyPoints || 0}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">Loyalty Points</p>
                    </div>
                </div>
            </CardContent>
        </Card>
      
      <ShippingAddressForm />

      <OrderHistory />

    </div>
  );
}
