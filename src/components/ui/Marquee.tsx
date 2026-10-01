/**
 * React Bits — Marquee
 * Seamlessly looping horizontal marquee. Duplicates children for infinite scroll.
 */
import { cn } from "@/lib/utils"
import type React from "react"
interface Props {
  children: React.ReactNode
  className?: string
  speed?: number /* px/s, controls animation-duration via width */
  gap?: number
  pauseOnHover?: boolean
}
export function Marquee({
  children,
  className,
  gap = 40,
  pauseOnHover = true,
}: Props) {
  return (
    <div
      className={[
        cn("relative flex overflow-hidden", className),
        "[mask-image:linear-gradient(to_right,_transparent,_black_10%,_black_90%,_transparent)]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={cn(
          "flex min-w-full shrink-0 items-center animate-[marquee-left_28s_linear_infinite] hover:[animation-play-state:paused]",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
        style={{ gap }}
      >
        {children}
        {children}
      </div>
    </div>
  )
}
