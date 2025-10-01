
'use client';

import { useState, useEffect, useTransition, useMemo } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Product, getProductById } from '@/lib/products';
import { updateProduct, updateProductStatus } from '@/app/admin/products/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import ProductForm from '@/components/admin/product-form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { getAllOrders, Order } from '@/lib/admin';

type ManageProductPageProps = {
    params: { id: string };
};

export default function ManageProductPage({ params }: ManageProductPageProps) {
    const [product, setProduct] = useState<Product | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, startSaving] = useTransition();
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [fetchedProduct, allOrders] = await Promise.all([
                getProductById(params.id),
                getAllOrders()
            ]);
            
            if (fetchedProduct) {
                setProduct(fetchedProduct);
                setOrders(allOrders);
            } else {
                notFound();
            }
            setLoading(false);
        };
        fetchData();
    }, [params.id]);

    const productAnalytics = useMemo(() => {
        if (!product) return { totalOrders: 0, totalRevenue: 0 };

        const relevantOrders = orders.filter(order => 
            order.items.some(item => item.productId === product.id)
        );

        const totalRevenue = relevantOrders.reduce((sum, order) => {
            const productItems = order.items.filter(item => item.productId === product.id);
            const orderRevenue = productItems.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
            return sum + orderRevenue;
        }, 0);

        return {
            totalOrders: relevantOrders.length,
            totalRevenue: totalRevenue,
        };

    }, [product, orders]);


    const handleProductSave = (productData: Omit<Product, 'id' | 'sizes' | 'status'>) => {
        if (!product) return;
        startSaving(async () => {
            try {
                await updateProduct(product.id, productData);
                toast({ title: "Success", description: "Product details updated successfully." });
                // Re-fetch product data to show updated info
                const updatedProduct = await getProductById(params.id);
                setProduct(updatedProduct);
            } catch (error) {
                console.error("Error saving product: ", error);
                toast({ title: "Error", description: "Failed to save product.", variant: "destructive" });
            }
        });
    };

    const handleToggleStatus = (newStatus: 'active' | 'inactive') => {
        if (!product) return;
         startSaving(async () => {
            try {
                await updateProductStatus(product.id, newStatus);
                setProduct(prev => prev ? { ...prev, status: newStatus } : null);
                toast({
                    title: "Product Status Updated",
                    description: `"${product.name}" has been ${newStatus === 'active' ? 'activated' : 'deactivated'}.`,
                });
            } catch (error) {
                toast({ title: "Error", description: "Failed to update status.", variant: "destructive" });
            }
        });
    };

    if (loading) {
        return <div>Loading product details...</div>;
    }

    if (!product) {
        return notFound();
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{product.name}</h1>
                    <p className="text-muted-foreground">Manage product details and view analytics.</p>
                </div>
                 <Button onClick={() => router.back()}>Back to Products</Button>
            </div>
            
            {/* Analytics Section Placeholder */}
            <Card>
                <CardHeader>
                    <CardTitle>Product Analytics</CardTitle>
                    <CardDescription>Performance metrics for this product.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="p-4 border rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground">Views</h3>
                        <p className="text-2xl font-bold">{Math.floor(Math.random() * 2000)}</p>
                        <p className="text-xs text-muted-foreground">View tracking not enabled</p>
                    </div>
                     <div className="p-4 border rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground">Orders</h3>
                        <p className="text-2xl font-bold">{productAnalytics.totalOrders}</p>
                    </div>
                     <div className="p-4 border rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Revenue</h3>
                        <p className="text-2xl font-bold">KES {productAnalytics.totalRevenue.toFixed(2)}</p>
                    </div>
                     <div className="p-4 border rounded-lg">
                        <h3 className="text-sm font-medium text-muted-foreground">Conversion Rate</h3>
                        <p className="text-2xl font-bold">--</p>
                         <p className="text-xs text-muted-foreground">Cannot be calculated</p>
                    </div>
                </CardContent>
                <CardContent>
                    <p className="text-center text-muted-foreground">Sales breakdown by channel (influencer, sales team, etc.) coming soon.</p>
                </CardContent>
            </Card>

            {/* Product Edit Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Edit Product Details</CardTitle>
                     <div className="flex items-center space-x-2 pt-4">
                        <Switch
                            id="product-status"
                            checked={product.status === 'active'}
                            onCheckedChange={(checked) => handleToggleStatus(checked ? 'active' : 'inactive')}
                            disabled={isSaving}
                        />
                        <Label htmlFor="product-status" className={product.status === 'active' ? 'text-green-600' : 'text-red-600'}>
                            {product.status === 'active' ? 'Active' : 'Inactive'}
                        </Label>
                        {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                    </div>
                </CardHeader>
                <CardContent>
                   <ProductForm 
                        product={product}
                        onSave={handleProductSave}
                        onCancel={() => router.back()}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
