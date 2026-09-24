import { cn } from "@/lib/utils";

function Skeleton({ className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton-shimmer rounded-md", className)}
      style={{ minHeight: 8, ...style }}
      {...props}
    />
  );
}

export { Skeleton };
