
'use client';

import type { Order, User } from '@/lib/admin';
import type { Product } from '@/lib/products';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, Users, CreditCard } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

type DashboardClientProps = {
    orders: Order[];
    products: Product[];
    users: User[];
}

export default function DashboardClient({ orders, products, users }: DashboardClientProps) {

    // Calculate metrics
    const totalRevenue = orders
        .filter(order => order.status === 'Delivered')
        .reduce((sum, order) => sum + order.subtotal, 0);

    const totalSales = orders.length;

    const activeCustomers = users.filter(user => user.role === 'customer').length;
    
    const activeProducts = products.filter(p => p.status === 'active').length;

    // Prepare data for the sales chart
    const monthlySales = Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    orders.forEach(order => {
        const orderDate = order.orderDate.toDate();
        if (orderDate.getFullYear() === currentYear) {
            const month = orderDate.getMonth();
            monthlySales[month] += order.subtotal;
        }
    });

    const salesData = [
        { name: "Jan", total: monthlySales[0] },
        { name: "Feb", total: monthlySales[1] },
        { name: "Mar", total: monthlySales[2] },
        { name: "Apr", total: monthlySales[3] },
        { name: "May", total: monthlySales[4] },
        { name: "Jun", total: monthlySales[5] },
        { name: "Jul", total: monthlySales[6] },
        { name: "Aug", total: monthlySales[7] },
        { name: "Sep", total: monthlySales[8] },
        { name: "Oct", total: monthlySales[9] },
        { name: "Nov", total: monthlySales[10] },
        { name: "Dec", total: monthlySales[11] },
    ];

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">KES {totalRevenue.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">From delivered orders</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{totalSales}</div>
                        <p className="text-xs text-muted-foreground">Total orders placed</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{activeCustomers}</div>
                        <p className="text-xs text-muted-foreground">Total registered customers</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeProducts}</div>
                        <p className="text-xs text-muted-foreground">Products available for sale</p>
                    </CardContent>
                </Card>
            </div>
            <div className="mt-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Overview - {currentYear}</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={salesData}>
                                <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                />
                                <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `KES ${value.toLocaleString()}`}
                                />
                                <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
