
'use client';

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useTransition } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { useAuth } from '@/hooks/use-auth';
import { processSuccessfulOrder } from '../actions';

const checkoutSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  phone: z.string().min(10, { message: 'A valid phone number is required.' }),
  firstName: z.string().min(1, { message: 'First name is required.' }),
  lastName: z.string().min(1, { message: 'Last name is required.' }),
  address: z.string().min(1, { message: 'Address is required.' }),
  city: z.string().min(1, { message: 'City is required.' }),
  county: z.string().min(1, { message: 'County is required.' }),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: '',
      phone: '',
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      county: '',
    },
  });

  useEffect(() => {
    if (user && !form.getValues('email')) {
      form.setValue('email', user.email || '');
      const nameParts = user.name.split(' ');
      form.setValue('firstName', nameParts[0] || '');
      form.setValue('lastName', nameParts.slice(1).join(' ') || '');
    }
  }, [user, form]);
  
  useEffect(() => {
    if (items.length === 0) {
      router.push('/');
    }
  }, [items, router]);

  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: form.getValues('email'),
    amount: subtotal * 100, // Amount in cents
    currency: 'KES',
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const onPaymentSuccess = (reference: { reference: string }) => {
    if (!user) {
        toast({
            title: 'Authentication Error',
            description: 'You must be logged in to complete a purchase.',
            variant: 'destructive',
        });
        return;
    }

    startTransition(async () => {
        await processSuccessfulOrder({
            user: user,
            items,
            subtotal,
            reference: reference.reference
        });

        toast({
            title: 'Order Placed!',
            description: 'Thank you for your purchase. A confirmation email has been sent.',
        });
        clearCart();
        router.push('/');
    });
  };

  const onPaymentClose = () => {
    console.log('Payment closed');
  };

  const onSubmit: SubmitHandler<CheckoutFormValues> = (data) => {
    const config = {
      ...paystackConfig,
      email: data.email,
      phone: data.phone,
      metadata: {
        name: `${data.firstName} ${data.lastName}`,
        address: `${data.address}, ${data.city}, ${data.county}`,
        cart: JSON.stringify(items.map(i => ({id: i.id, name: i.product.name, quantity: i.quantity})))
      },
    };
    initializePayment({ onSuccess: onPaymentSuccess, onClose: onPaymentClose, config });
  };
  

  if (items.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty.</h1>
        <Button asChild className="mt-4">
          <a href="/">Continue Shopping</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <h1 className="font-headline text-3xl font-bold">Order Summary</h1>
          <div className="mt-8 space-y-6">
            {items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                    {item.product.imageId && (
                      <Image
                        src={item.product.imageId}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {item.quantity}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground">{item.size}</p>
                  </div>
                  <p className="font-medium">
                    KES {(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
            ))}
          </div>
          <Separator className="my-8" />
          <div className="space-y-4 text-lg">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>KES {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>KES {subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="lg:col-span-1">
          <h1 className="font-headline text-3xl font-bold">
            Shipping Information
          </h1>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="mt-8 space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Contact Information</h2>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input placeholder="you@example.com" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="0712 345 678" {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Shipping Address</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
                <FormField control={form.control} name="address" render={({ field }) => ( <FormItem><FormLabel>Address</FormLabel><FormControl><Input placeholder="e.g. Street, Estate, Building, Apt No." {...field} /></FormControl><FormMessage /></FormItem> )} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField control={form.control} name="city" render={({ field }) => ( <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name="county" render={({ field }) => ( <FormItem><FormLabel>County</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={form.formState.isSubmitting || isPending}
              >
                {form.formState.isSubmitting || isPending
                  ? 'Processing...'
                  : `Pay KES ${subtotal.toFixed(2)}`}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
