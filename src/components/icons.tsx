import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function LuxeDailyLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <div className={cn("font-headline text-2xl font-bold tracking-tight", className)}>
      Luxe Daily
    </div>
  );
}
