
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { getAllUsers, getAllOrders, getOrdersByUserId, Order } from '@/lib/admin';
import type { User, UserRole } from '@/hooks/use-auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { updateUserRole } from './actions';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

type EnrichedUser = User & { signupDate?: Timestamp };

// Helper function to safely convert a Firestore Timestamp or a JS Date to a JS Date
const toJavaScriptDate = (date: any): Date | null => {
  if (!date) return null;
  if (date.toDate) return date.toDate(); // It's a Firestore Timestamp
  if (date instanceof Date) return date; // It's already a JS Date
  return null; // Or handle as an error
};


function UserDetailsModal({ user, open, onOpenChange, onUserUpdate }: { user: EnrichedUser | null; open: boolean; onOpenChange: (open: boolean) => void; onUserUpdate: () => void; }) {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState<UserRole | undefined>(user?.role);
    const [isSaving, startSaving] = useTransition();

    useEffect(() => {
        if (user && open) {
            setSelectedRole(user.role);
            const fetchOrders = async () => {
                setLoading(true);
                const userOrders = await getOrdersByUserId(user.uid);
                setOrders(userOrders);
                setLoading(false);
            };
            fetchOrders();
        }
    }, [user, open]);

    const handleRoleChange = (role: UserRole) => {
        setSelectedRole(role);
    };
    
    const handleSaveChanges = () => {
        if (!user || !selectedRole || user.role === selectedRole) return;
        startSaving(async () => {
            const result = await updateUserRole(user.uid, user.email || '', user.name, selectedRole);
            if (result.success) {
                toast({ title: 'Role Updated', description: `${user.name}'s role has been changed to ${selectedRole}.`});
                onUserUpdate();
                onOpenChange(false);
            } else {
                toast({ title: 'Error', description: result.error, variant: 'destructive' });
            }
        });
    }
    
    if (!user) return null;

    const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase();
    const availableRoles: UserRole[] = ['customer', 'admin', 'influencer', 'sales', 'fulfillment', 'digital_marketer'];
    const signupDate = toJavaScriptDate(user.signupDate);

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
                                Joined on: {signupDate ? format(signupDate, 'PPP') : 'N/A'}
                            </p>
                        </div>
                    </div>
                </DialogHeader>
                
                <div className="mt-4 grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="user-role" className="text-base font-semibold">User Role</Label>
                        <Select value={selectedRole} onValueChange={(value: UserRole) => handleRoleChange(value)}>
                            <SelectTrigger id="user-role" className="w-[280px]">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableRoles.map(role => (
                                    <SelectItem key={role} value={role} className="capitalize">{role.replace('_', ' ')}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-sm text-muted-foreground">Changing the role will affect user permissions and send an email notification.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-2">Purchase History</h3>
                        <div className="max-h-60 overflow-y-auto rounded-md border">
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
                                        {orders.length > 0 ? orders.map(order => {
                                             const orderDate = toJavaScriptDate(order.orderDate);
                                             return (
                                                <TableRow key={order.id}>
                                                    <TableCell className="font-medium">{order.reference}</TableCell>
                                                    <TableCell>{orderDate ? format(orderDate, 'PPp') : 'N/A'}</TableCell>
                                                    <TableCell>KES {order.subtotal.toFixed(2)}</TableCell>
                                                    <TableCell><Badge>{order.status}</Badge></TableCell>
                                                </TableRow>
                                             )
                                        }) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center">No orders found.</TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </div>
                </div>

                 <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSaveChanges} disabled={isSaving || user.role === selectedRole}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
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

    const fetchUsers = async () => {
        setLoading(true);
        const userList = await getAllUsers();
        setUsers(userList as EnrichedUser[]);
        setLoading(false);
    }

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
            <UserDetailsModal user={selectedUser} open={isModalOpen} onOpenChange={setModalOpen} onUserUpdate={fetchUsers} />
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
                                    {filteredUsers.map(user => {
                                        const signupDate = toJavaScriptDate(user.signupDate);
                                        return (
                                        <TableRow key={user.uid} onClick={() => handleUserClick(user)} className="cursor-pointer">
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell><Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="capitalize">{user.role.replace('_', ' ')}</Badge></TableCell>
                                            <TableCell>{signupDate ? format(signupDate, 'PPP') : 'N/A'}</TableCell>
                                        </TableRow>
                                    )})}
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
                                    {filteredOrders.map(order => {
                                        const orderDate = toJavaScriptDate(order.orderDate);
                                        return (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">{order.reference}</TableCell>
                                                <TableCell>
                                                    <div>{order.userName}</div>
                                                    <div className="text-xs text-muted-foreground">{order.userEmail}</div>
                                                </TableCell>
                                                <TableCell>{orderDate ? format(orderDate, 'PPp') : 'N/A'}</TableCell>
                                                <TableCell>KES {order.subtotal.toFixed(2)}</TableCell>
                                                <TableCell><Badge>{order.status}</Badge></TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

    