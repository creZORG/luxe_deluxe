import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

export function LunaLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <div className={cn("font-headline text-2xl font-bold tracking-tight", className)}>
      Luna
    </div>
  );
}
