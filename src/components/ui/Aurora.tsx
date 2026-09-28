/**
 * Aceternity UI — Aurora Background
 * Animated radial gradient orbs creating an ambient aurora effect.
 */
import { cn } from "@/lib/utils"
import type React from "react"
interface Props {
  className?: string
  children?: React.ReactNode
  intensity?: "low" | "medium" | "high"
}
export function Aurora({ className, children, intensity = "medium" }: Props) {
  const op = intensity === "low" ? 0.18 : intensity === "high" ? 0.45 : 0.28
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-0 z-0 select-none">
        {/* White orb — top left */}
        <div
          style={{
            background: `radial-gradient(circle, rgba(255,255,255,${op * 0.45}) 0%, transparent 68%)`,
          }}
          className="[position:absolute] [top:2%] [left:8%] [width:720px] [height:720px] [border-radius:50%] [filter:blur(72px)] [animation:aurora-drift-1_16s_ease-in-out_infinite_alternate] [will-change:transform]"
        />
        {/* Gray orb — top right */}
        <div
          style={{
            background: `radial-gradient(circle, rgba(200,200,200,${op * 0.25}) 0%, transparent 70%)`,
          }}
          className="[position:absolute] [top:20%] [right:3%] [width:640px] [height:640px] [border-radius:50%] [filter:blur(80px)] [animation:aurora-drift-2_20s_ease-in-out_infinite_alternate] [will-change:transform]"
        />
        {/* Soft white — bottom center */}
        <div
          style={{
            background: `radial-gradient(circle, rgba(255,255,255,${op * 0.18}) 0%, transparent 70%)`,
          }}
          className="[position:absolute] [bottom:8%] [left:38%] [width:440px] [height:440px] [border-radius:50%] [filter:blur(64px)] [animation:aurora-drift-3_12s_ease-in-out_infinite_alternate] [will-change:transform]"
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
