'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getOrderByReference, Order } from '@/lib/admin';

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const orderRef = searchParams.get('ref');
    const email = searchParams.get('email');

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderRef) {
            const fetchOrder = async () => {
                setLoading(true);
                const fetchedOrder = await getOrderByReference(orderRef);
                setOrder(fetchedOrder);
                setLoading(false);
            }
            fetchOrder();
        } else {
            setLoading(false);
        }
    }, [orderRef]);

    if (loading) {
        return (
            <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Loading your order details...</p>
            </div>
        )
    }
    
    if (!order) {
         return (
            <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center text-center">
                <CardTitle>Order Not Found</CardTitle>
                <CardDescription>We couldn't find details for this order.</CardDescription>
                <Button asChild className="mt-4">
                    <Link href="/">Continue Shopping</Link>
                </Button>
            </div>
         )
    }

    return (
        <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center bg-background px-4 py-12 text-center">
            <Card className="w-full max-w-2xl">
                <CardHeader className="items-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                    <CardTitle className="text-3xl font-bold">Thank You For Your Order!</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground pt-2">
                        Your order has been placed successfully.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p>A confirmation email has been sent to <strong>{email}</strong>.</p>
                    
                    <div className="text-left bg-muted p-4 rounded-lg space-y-4">
                        <h3 className="font-semibold text-lg">Order Summary (Ref: {order.reference})</h3>
                        
                        {/* Items List */}
                        <div className="space-y-4">
                           {order.items.map((item, index) => (
                             <div key={index} className="flex items-center gap-4">
                                <Image src={item.imageId} alt={item.productName} width={64} height={64} className="rounded-md border object-cover" />
                                <div className="flex-1">
                                    <p className="font-medium">{item.productName}</p>
                                    <p className="text-sm text-muted-foreground">{item.size} &times; {item.quantity}</p>
                                </div>
                                <p className="font-medium">KES {(item.price * item.quantity).toFixed(2)}</p>
                             </div>
                           ))}
                        </div>
                        
                        <Separator />

                        {/* Totals */}
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span>KES {order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping:</span>
                                <span>FREE</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg">
                                <span>Total Paid:</span>
                                <span>KES {order.subtotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">You can view your order history and track its status from your profile page.</p>

                    <div className="flex gap-4 pt-4">
                        <Button asChild className="flex-1">
                            <Link href="/">Continue Shopping</Link>
                        </Button>
                        <Button asChild variant="outline" className="flex-1">
                            <Link href="/profile">Go to My Profile</Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}


export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ConfirmationContent />
        </Suspense>
    );
}
