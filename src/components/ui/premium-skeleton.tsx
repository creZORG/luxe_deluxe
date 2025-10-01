
import { cn } from "@/lib/utils"

function PremiumSkeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-muted",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:border-t before:border-primary/10 before:bg-gradient-to-r before:from-transparent before:via-primary/10 before:to-transparent",
        className
      )}
      {...props}
    />
  )
}

export { PremiumSkeleton }
