
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
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { getAllOrders, Order, OrderStatus } from '@/lib/admin';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateOrderStatus } from '@/app/actions';
import { toast } from '@/hooks/use-toast';
import { Loader2, Truck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


function UpdateStatusModal({ order, open, onOpenChange, onStatusUpdate }: { order: Order | null; open: boolean; onOpenChange: (open: boolean) => void; onStatusUpdate: () => void; }) {
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
            const result = await updateOrderStatus(order.id, status, trackingNumber);
            if (result.success) {
                toast({ title: "Status Updated", description: `Order #${order.reference} has been updated.` });
                onStatusUpdate();
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
    const [isModalOpen, setModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<OrderStatus | 'All'>('All');

    const fetchOrders = async () => {
        setLoading(true);
        const orderList = await getAllOrders();
        setOrders(orderList);
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        if (activeTab === 'All') return orders;
        return orders.filter(order => order.status === activeTab);
    }, [orders, activeTab]);

    const handleUpdateClick = (order: Order) => {
        setSelectedOrder(order);
        setModalOpen(true);
    };

    const statusCounts = useMemo(() => {
        return orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {} as Record<OrderStatus, number>);
    }, [orders]);

    if (loading) {
        return <div>Loading orders...</div>;
    }

    return (
        <div>
            <UpdateStatusModal
                order={selectedOrder}
                open={isModalOpen}
                onOpenChange={setModalOpen}
                onStatusUpdate={fetchOrders}
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
                                    {filteredOrders.length > 0 ? filteredOrders.map(order => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.reference}</TableCell>
                                            <TableCell>{format(order.orderDate.toDate(), 'PPp')}</TableCell>
                                            <TableCell>
                                                <div>{order.userName}</div>
                                                <div className="text-xs text-muted-foreground">{order.userEmail}</div>
                                            </TableCell>
                                            <TableCell>KES {order.subtotal.toFixed(2)}</TableCell>
                                            <TableCell><Badge>{order.status}</Badge></TableCell>
                                            <TableCell>
                                                <Button variant="outline" size="sm" onClick={() => handleUpdateClick(order)}>
                                                    <Truck className="mr-2 h-4 w-4" />
                                                    Update
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )) : (
                                         <TableRow>
                                            <TableCell colSpan={6} className="text-center h-24">
                                                No orders found for this status.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
