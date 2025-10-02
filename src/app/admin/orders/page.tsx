
'use client';

import { useState, useEffect, useMemo, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { type Order, type OrderStatus, getUserById } from '@/lib/admin';
import type { User } from '@/hooks/use-auth';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateOrderStatus } from '@/app/actions';
import { toast } from '@/hooks/use-toast';
import { Loader2, Truck, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';

// Helper function to safely convert a Firestore Timestamp or a JS Date to a JS Date
const toJavaScriptDate = (date: any): Date | null => {
  if (!date) return null;
  if (date.toDate) return date.toDate(); // It's a Firestore Timestamp
  if (date instanceof Date) return date; // It's already a JS Date
  return null; // Or handle as an error
};

function OrderDetailsModal({ order, open, onOpenChange }: { order: Order | null; open: boolean; onOpenChange: (open: boolean) => void; }) {
    const [customer, setCustomer] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomer = async () => {
            if (order) {
                setLoading(true);
                const user = await getUserById(order.userId);
                setCustomer(user);
                setLoading(false);
            }
        };
        fetchCustomer();
    }, [order]);

    if (!order) return null;

    const orderDate = toJavaScriptDate(order.orderDate);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Order Details</DialogTitle>
                    <DialogDescription>
                        Full details for order #{order.reference}.
                    </DialogDescription>
                </DialogHeader>
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <div className="grid gap-6 py-4">
                        {/* Customer & Shipping Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Customer & Shipping</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {customer?.shippingAddress ? (
                                    <>
                                        <p><strong>Name:</strong> {customer.name}</p>
                                        <p><strong>Email:</strong> {customer.email}</p>
                                        <p><strong>Phone:</strong> {customer.shippingAddress.phone}</p>
                                        <div className="text-sm border-t pt-4 mt-4">
                                            <h4 className="font-semibold mb-2">Shipping Address</h4>
                                            <p>{customer.shippingAddress.firstName} {customer.shippingAddress.lastName}</p>
                                            <p>{customer.shippingAddress.address}</p>
                                            <p>{customer.shippingAddress.city}, {customer.shippingAddress.county}</p>
                                            {customer.shippingAddress.deliveryDescription && <p className="text-muted-foreground mt-2"><strong>Instructions:</strong> {customer.shippingAddress.deliveryDescription}</p>}
                                        </div>
                                    </>
                                ) : (
                                    <p>Shipping address not available.</p>
                                )}
                            </CardContent>
                        </Card>
                        {/* Order Items */}
                         <Card>
                            <CardHeader>
                                <CardTitle>Order Items</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Size</TableHead>
                                            <TableHead>Qty</TableHead>
                                            <TableHead className="text-right">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {order.items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="flex items-center gap-2">
                                                    <Image src={item.imageId} alt={item.productName} width={40} height={40} className="rounded-md object-cover" />
                                                    {item.productName}
                                                </TableCell>
                                                <TableCell>{item.size}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell className="text-right">KES {(item.price * item.quantity).toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                         </Card>
                    </div>
                )}
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Close</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function UpdateStatusModal({ order, open, onOpenChange }: { order: Order | null; open: boolean; onOpenChange: (open: boolean) => void; }) {
    const [status, setStatus] = useState<OrderStatus>('Pending');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        if (order) {
            setStatus(order.status);
            setTrackingNumber(order.trackingNumber || '');
        }
    }, [order]);

    const handleSave = () => {
        if (!order) return;
        startTransition(async () => {
            // Note: updateOrderStatus will trigger the onSnapshot listener, so no need to refetch manually
            const result = await updateOrderStatus(order.id, status, trackingNumber);
            if (result.success) {
                toast({ title: "Status Updated", description: `Order #${order.reference} has been updated.` });
                onOpenChange(false);
            } else {
                toast({ title: "Error", description: result.error, variant: 'destructive' });
            }
        });
    };

    if (!order) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Order Status</DialogTitle>
                    <DialogDescription>
                        Update the status and tracking information for order #{order.reference}.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label htmlFor="status" className="text-sm font-medium">Order Status</label>
                        <Select value={status} onValueChange={(value: OrderStatus) => setStatus(value)}>
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Shipped">Shipped</SelectItem>
                                <SelectItem value="Delivered">Delivered</SelectItem>
                                <SelectItem value="Cancelled">Cancelled</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {status === 'Shipped' && (
                        <div className="space-y-2">
                             <label htmlFor="trackingNumber" className="text-sm font-medium">Tracking Number</label>
                            <Input
                                id="trackingNumber"
                                placeholder="Enter tracking number"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                            />
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSave} disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
    const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<OrderStatus | 'All'>('All');

    useEffect(() => {
        setLoading(true);
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, orderBy('orderDate', 'desc'));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const orderList = querySnapshot.docs.map(doc => {
                 const data = doc.data();
                 return { id: doc.id, ...data } as Order;
            });
            setOrders(orderList);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching real-time orders:", error);
            toast({
                title: "Error",
                description: "Could not fetch real-time orders. Please refresh.",
                variant: "destructive"
            });
            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const filteredOrders = useMemo(() => {
        if (activeTab === 'All') return orders;
        return orders.filter(order => order.status === activeTab);
    }, [orders, activeTab]);

    const handleUpdateClick = (order: Order) => {
        setSelectedOrder(order);
        setUpdateModalOpen(true);
    };
    
    const handleDetailsClick = (order: Order) => {
        setSelectedOrder(order);
        setDetailsModalOpen(true);
    };

    const statusCounts = useMemo(() => {
        return orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {} as Record<OrderStatus, number>);
    }, [orders]);

    return (
        <div>
            <UpdateStatusModal
                order={selectedOrder}
                open={isUpdateModalOpen}
                onOpenChange={setUpdateModalOpen}
            />
             <OrderDetailsModal
                order={selectedOrder}
                open={isDetailsModalOpen}
                onOpenChange={setDetailsModalOpen}
            />
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Order Management</h1>
            </div>

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList className="mb-4">
                    <TabsTrigger value="All">All ({orders.length})</TabsTrigger>
                    <TabsTrigger value="Pending">Pending ({statusCounts['Pending'] || 0})</TabsTrigger>
                    <TabsTrigger value="Shipped">Shipped ({statusCounts['Shipped'] || 0})</TabsTrigger>
                    <TabsTrigger value="Delivered">Delivered ({statusCounts['Delivered'] || 0})</TabsTrigger>
                    <TabsTrigger value="Cancelled">Cancelled ({statusCounts['Cancelled'] || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                    <Card>
                        <CardContent className="p-0">
                             {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <Loader2 className="h-8 w-8 animate-spin" />
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Order ID</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Customer</TableHead>
                                            <TableHead>Total</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredOrders.length > 0 ? filteredOrders.map(order => {
                                            const orderDate = toJavaScriptDate(order.orderDate);
                                            return (
                                                <TableRow key={order.id}>
                                                    <TableCell className="font-medium">{order.reference}</TableCell>
                                                    <TableCell>{orderDate ? format(orderDate, 'PPp') : 'N/A'}</TableCell>
                                                    <TableCell>
                                                        <div>{order.userName}</div>
                                                        <div className="text-xs text-muted-foreground">{order.userEmail}</div>
                                                    </TableCell>
                                                    <TableCell>KES {order.subtotal.toFixed(2)}</TableCell>
                                                    <TableCell><Badge>{order.status}</Badge></TableCell>
                                                    <TableCell className="flex gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => handleDetailsClick(order)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Details
                                                        </Button>
                                                        <Button variant="outline" size="sm" onClick={() => handleUpdateClick(order)}>
                                                            <Truck className="mr-2 h-4 w-4" />
                                                            Update
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        }) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center h-24">
                                                    No orders found for this status.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
