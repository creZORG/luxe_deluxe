import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center bg-background px-4 text-center">
      <div className="relative w-full max-w-lg">
        <div
          className="absolute inset-0 text-center"
          aria-hidden="true"
        >
          <span className="text-[20rem] font-bold leading-none text-card-foreground/5">
            404
          </span>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center py-24">
          <h1 className="font-headline text-5xl font-bold text-foreground">
            Lost in the Mist?
          </h1>
          <p className="mt-4 max-w-sm text-lg text-muted-foreground">
            It seems the page you are looking for has drifted away. Let us guide you back to luxury.
          </p>
          <Button asChild className="mt-8" size="lg">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
