
'use client';

import { useState, useEffect, useMemo } from 'react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllUsers, getAllOrders, getOrdersByUserId, Order } from '@/lib/admin';
import type { User } from '@/hooks/use-auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';

type EnrichedUser = User & { signupDate?: { toDate: () => Date } };

function UserDetailsModal({ user, open, onOpenChange }: { user: EnrichedUser | null; open: boolean; onOpenChange: (open: boolean) => void; }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && open) {
            const fetchOrders = async () => {
                setLoading(true);
                const userOrders = await getOrdersByUserId(user.uid);
                setOrders(userOrders);
                setLoading(false);
            };
            fetchOrders();
        }
    }, [user, open]);
    
    if (!user) return null;

    const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarFallback className="text-2xl">{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <DialogTitle className="text-2xl">{user.name}</DialogTitle>
                            <DialogDescription>{user.email} - <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge></DialogDescription>
                            <p className="text-sm text-muted-foreground mt-1">
                                Joined on: {user.signupDate ? format(user.signupDate.toDate(), 'PPP') : 'N/A'}
                            </p>
                        </div>
                    </div>
                </DialogHeader>
                <div className="mt-4">
                    <h3 className="text-lg font-semibold mb-2">Purchase History</h3>
                    <div className="max-h-96 overflow-y-auto rounded-md border">
                        {loading ? <p className="p-4">Loading orders...</p> : (
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
                                    {orders.length > 0 ? orders.map(order => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.reference}</TableCell>
                                            <TableCell>{format(order.orderDate.toDate(), 'PPp')}</TableCell>
                                            <TableCell>KES {order.subtotal.toFixed(2)}</TableCell>
                                            <TableCell><Badge>{order.status}</Badge></TableCell>
                                        </TableRow>
                                    )) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center">No orders found.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function UsersPage() {
    const [users, setUsers] = useState<EnrichedUser[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<EnrichedUser | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [userList, orderList] = await Promise.all([getAllUsers(), getAllOrders()]);
            setUsers(userList as EnrichedUser[]);
            setOrders(orderList);
            setLoading(false);
        };
        fetchData();
    }, []);

    const filteredUsers = useMemo(() =>
        users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        ), [users, searchTerm]);

    const filteredOrders = useMemo(() =>
        orders.filter(order =>
            order.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.userName.toLowerCase().includes(searchTerm.toLowerCase())
        ), [orders, searchTerm]);

    const handleUserClick = (user: EnrichedUser) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <UserDetailsModal user={selectedUser} open={isModalOpen} onOpenChange={setModalOpen} />
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">User Management</h1>
            </div>
            <Input
                placeholder="Search by name, email, or order number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-6 max-w-sm"
            />
            <Tabs defaultValue="users">
                <TabsList className="mb-4">
                    <TabsTrigger value="users">Users ({filteredUsers.length})</TabsTrigger>
                    <TabsTrigger value="orders">Orders ({filteredOrders.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="users">
                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Joined</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map(user => (
                                        <TableRow key={user.uid} onClick={() => handleUserClick(user)} className="cursor-pointer">
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>{user.role}</Badge></TableCell>
                                            <TableCell>{user.signupDate ? format(user.signupDate.toDate(), 'PPP') : 'N/A'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="orders">
                     <Card>
                        <CardContent className="p-0">
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map(order => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">{order.reference}</TableCell>
                                            <TableCell>
                                                <div>{order.userName}</div>
                                                <div className="text-xs text-muted-foreground">{order.userEmail}</div>
                                            </TableCell>
                                            <TableCell>{format(order.orderDate.toDate(), 'PPp')}</TableCell>
                                            <TableCell>KES {order.subtotal.toFixed(2)}</TableCell>
                                            <TableCell><Badge>{order.status}</Badge></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

