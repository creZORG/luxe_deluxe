
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
import { useCart } from '@/hooks/use-cart';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

type CartSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const { items, removeItem, updateItemQuantity, subtotal } = useCart();

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
        {items.length > 0 ? (
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-6">
              {items.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md">
                      {item.product.imageId && (
                        <Image
                          src={item.product.imageId}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-primary-foreground/70">
                        {item.size}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                            onClick={() =>
                              updateItemQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-6 text-center">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                            onClick={() =>
                              updateItemQuantity(item.id, item.quantity + 1)
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="font-medium">KES {item.price.toFixed(2)}</p>
                      </div>
                    </div>
                     <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-primary-foreground/70">Your bag is empty.</p>
          </div>
        )}
        {items.length > 0 && (
            <>
                <Separator className="my-4 bg-primary-foreground/20" />
                <SheetFooter className="mt-auto">
                    <div className="w-full space-y-4">
                        <div className="flex justify-between font-medium">
                            <span>Subtotal</span>
                            <span>KES {subtotal.toFixed(2)}</span>
                        </div>
                        <Button
                          size="lg"
                          asChild
                          className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                          onClick={() => onOpenChange(false)}
                        >
                          <Link href="/checkout">
                            Checkout
                          </Link>
                        </Button>
                    </div>
                </SheetFooter>
            </>
        )}
      </SheetContent>
    </Sheet>
  );
}
