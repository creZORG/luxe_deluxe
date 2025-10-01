'use client';

import Image from 'next/image';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

type CartSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CartSheet({ open, onOpenChange }: CartSheetProps) {
  // Mock data for cart items
  const cartItems = [
    {
      id: 1,
      name: 'Calming Lavender Shower Gel',
      size: '500ml',
      price: 24.99,
      quantity: 1,
      image: 'https://picsum.photos/seed/101/100/100',
    },
    {
      id: 2,
      name: 'Soft Cotton Fabric Softener',
      size: '800ml',
      price: 32.99,
      quantity: 1,
      image: 'https://picsum.photos/seed/201/100/100',
    },
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col bg-primary text-primary-foreground sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-primary-foreground">Your Bag</SheetTitle>
          <SheetDescription className="text-primary-foreground/80">
            Items in your shopping bag.
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4 bg-primary-foreground/20" />
        {cartItems.length > 0 ? (
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-primary-foreground/70">{item.size}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm">Qty: {item.quantity}</p>
                      <p className="font-medium">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-primary-foreground/70">Your bag is empty.</p>
          </div>
        )}
        <Separator className="my-4 bg-primary-foreground/20" />
        <SheetFooter className="mt-auto">
            <div className="w-full space-y-4">
                <div className="flex justify-between font-medium">
                    <span>Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                </div>
                <Button size="lg" className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                    Checkout
                </Button>
            </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
