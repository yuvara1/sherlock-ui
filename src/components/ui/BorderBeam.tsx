/**
 * Aceternity UI — Border Beam
 * Animated travelling light that traces a card's border.
 */
import { cn } from "@/lib/utils"
interface Props {
  className?: string
  size?: number
  duration?: number
  colorFrom?: string
  colorTo?: string
  delay?: number
}
export function BorderBeam({
  className,
  size = 200,
  duration = 12,
  colorFrom = "transparent",
  colorTo = "var(--text-3)",
  delay = 0,
}: Props) {
  return (
    <div
      style={
        {
          "--size": size,
          "--duration": `${duration}s`,
          "--delay": `${delay}s`,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--border-width": "1px",
        } as React.CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        className,
      )}
    >
      <div
        style={{
          animation: `border-beam-spin ${duration}s linear infinite`,
          animationDelay: `${delay}s`,
          animation: `border-beam-spin ${duration}s linear infinite`,
          animationDelay: `${delay}s`,
        }}
        className="[background:linear-gradient(var(--bg),_var(--bg))_padding-box,&#xA;____________conic-gradient(from_calc(var(--angle,_0deg)),_var(--color-from),_var(--color-to)_10%,_var(--color-from)_20%)_border-box]"
      />
    </div>
  )
}
import type React from "react"
