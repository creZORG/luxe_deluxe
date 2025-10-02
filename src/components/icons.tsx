import { cn } from "@/lib/utils";
import type { SVGProps } from "react";
import Image from 'next/image';

export function LunaLogo({ className, ...props }: SVGProps<SVGSVGElement> & {className?: string}) {
  return (
    <div className={cn("relative w-20 h-10", className)}>
      <Image
        src="https://i.postimg.cc/2S5Kkf2m/logo-original.png"
        alt="Luna logo"
        fill
        className="object-contain"
      />
    </div>
  );
}
