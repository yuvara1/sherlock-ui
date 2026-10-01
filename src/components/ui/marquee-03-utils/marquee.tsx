import { cn } from "@/lib/utils"
import { useRef } from "react"
import type React from "react"
interface MarqueeProps {
  children: React.ReactNode
  className?: string
  vertical?: boolean
  reverse?: boolean
  pauseOnHover?: boolean
}
export function Marquee({
  children,
  className,
  vertical = false,
  reverse = false,
  pauseOnHover = false,
}: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const pause = () => {
    if (pauseOnHover && trackRef.current)
      trackRef.current.style.animationPlayState = "paused"
  }
  const resume = () => {
    if (pauseOnHover && trackRef.current)
      trackRef.current.style.animationPlayState = "running"
  }
  return (
    <div
      onMouseEnter={pause}
      onMouseLeave={resume}
      className={[
        cn(
          "flex overflow-hidden",
          vertical ? "flex-col" : "flex-row",
          className,
        ),
        vertical
          ? "[mask-image:linear-gradient(to_bottom,_transparent,_black_15%,_black_85%,_transparent)]"
          : "[mask-image:linear-gradient(to_right,_transparent,_black_10%,_black_90%,_transparent)]",
        vertical
          ? "[-webkit-mask-image:linear-gradient(to_bottom,_transparent,_black_15%,_black_85%,_transparent)]"
          : "[-webkit-mask-image:linear-gradient(to_right,_transparent,_black_10%,_black_90%,_transparent)]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        ref={trackRef}
        className={[
          cn(
            "flex shrink-0 will-change-transform",
            vertical ? "flex-col" : "flex-row",
            vertical
              ? reverse
                ? "animate-[marquee-down_var(--duration,20s)_linear_infinite]"
                : "animate-[marquee-up_var(--duration,20s)_linear_infinite]"
              : reverse
                ? "animate-[marquee-right_var(--duration,20s)_linear_infinite]"
                : "animate-[marquee-left_var(--duration,20s)_linear_infinite]",
          ),
          vertical ? "[gap:12px]" : "[gap:16px]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
        {children}
      </div>
    </div>
  )
}
