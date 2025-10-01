
import { LunaLogo } from '@/components/icons';
import { cn } from '@/lib/utils';

export function LoadingModal({
  className,
  message,
}: {
  className?: string;
  message?: string;
}) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm',
        className
      )}
    >
      <div className="animate-pulse">
        <LunaLogo className="text-5xl" />
      </div>
      {message && (
        <p className="mt-4 text-lg text-muted-foreground">{message}</p>
      )}
      <div className="sr-only">Loading...</div>
    </div>
  );
}
