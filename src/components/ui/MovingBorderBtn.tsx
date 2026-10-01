/**
 * Aceternity UI — Moving Border Button
 * Conic gradient border that rotates around the button edge.
 */
import { cn } from "@/lib/utils"
import type React from "react"
interface Props {
  children: React.ReactNode
  className?: string
  innerClassName?: string
  onClick?: () => void
  type?: "button" | "submit"
  disabled?: boolean
  duration?: number
}
export function MovingBorderBtn({
  children,
  className,
  innerClassName,
  onClick,
  type = "button",
  disabled = false,
  duration = 3,
}: Props) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        cn(
          "relative inline-flex overflow-hidden rounded-xl p-[1.5px] focus-visible:outline-none",
          className,
        ),
        disabled ? "[cursor:not-allowed]" : "[cursor:pointer]",
        disabled ? "[opacity:0.5]" : "[opacity:1]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Spinning conic gradient */}
      <span
        style={{
          animation: `conic-spin ${duration}s linear infinite`,
          animation: `conic-spin ${duration}s linear infinite`,
        }}
        className="[background:conic-gradient(from_90deg_at_50%_50%,_#0070f3_0%,_#7c3aed_30%,_#06b6d4_60%,_#0070f3_100%)]"
      />
      {/* Inner content */}
      <span
        className={[
          cn(
            "relative z-10 flex w-full items-center justify-center gap-2 rounded-[10px] px-6 py-3 text-sm font-semibold text-white backdrop-blur-3xl",
            innerClassName,
          ),
          "[background:#000] [letter-spacing:-0.004em]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {children}
      </span>
    </button>
  )
}
