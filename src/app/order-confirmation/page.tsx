'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function ConfirmationContent() {
    const searchParams = useSearchParams();
    const orderRef = searchParams.get('ref');
    const amount = searchParams.get('amount');
    const email = searchParams.get('email');

    return (
        <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center bg-background px-4 py-12 text-center">
            <Card className="w-full max-w-lg">
                <CardHeader className="items-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                    <CardTitle className="text-3xl font-bold">Thank You For Your Order!</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground pt-2">
                        Your order has been placed successfully.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p>A confirmation email has been sent to <strong>{email}</strong> with the full details of your purchase.</p>
                    
                    <div className="text-left bg-muted p-4 rounded-lg">
                        <h3 className="font-semibold text-lg mb-2">Order Summary</h3>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Order Reference:</span>
                            <span className="font-mono">{orderRef}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Amount Paid:</span>
                            <span className="font-semibold">KES {Number(amount).toFixed(2)}</span>
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
