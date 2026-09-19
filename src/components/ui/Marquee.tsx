/**
 * React Bits — Marquee
 * Seamlessly looping horizontal marquee. Duplicates children for infinite scroll.
 */
import { cn } from "@/lib/utils";
import type React from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
  speed?: number; /* px/s, controls animation-duration via width */
  gap?: number;
  pauseOnHover?: boolean;
}

export function Marquee({ children, className, gap = 40, pauseOnHover = true }: Props) {
  return (
    <div className={cn("relative flex overflow-hidden", className)} style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
      <div
        className={cn("flex min-w-full shrink-0 items-center marquee-track", pauseOnHover && "hover:[animation-play-state:paused]")}
        style={{ gap }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
