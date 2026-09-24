/**
 * Aceternity UI — Aurora Background
 * Animated radial gradient orbs creating an ambient aurora effect.
 */
import { cn } from "@/lib/utils";
import type React from "react";

interface Props {
  className?: string;
  children?: React.ReactNode;
  intensity?: "low" | "medium" | "high";
}

export function Aurora({ className, children, intensity = "medium" }: Props) {
  const op = intensity === "low" ? 0.18 : intensity === "high" ? 0.45 : 0.28;
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="pointer-events-none absolute inset-0 z-0 select-none">
        {/* White orb — top left */}
        <div
          style={{
            position: "absolute",
            top: "2%",
            left: "8%",
            width: 720,
            height: 720,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(255,255,255,${op * 0.45}) 0%, transparent 68%)`,
            filter: "blur(72px)",
            animation: "aurora-drift-1 16s ease-in-out infinite alternate",
            willChange: "transform",
          }}
        />
        {/* Gray orb — top right */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "3%",
            width: 640,
            height: 640,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(200,200,200,${op * 0.25}) 0%, transparent 70%)`,
            filter: "blur(80px)",
            animation: "aurora-drift-2 20s ease-in-out infinite alternate",
            willChange: "transform",
          }}
        />
        {/* Soft white — bottom center */}
        <div
          style={{
            position: "absolute",
            bottom: "8%",
            left: "38%",
            width: 440,
            height: 440,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(255,255,255,${op * 0.18}) 0%, transparent 70%)`,
            filter: "blur(64px)",
            animation: "aurora-drift-3 12s ease-in-out infinite alternate",
            willChange: "transform",
          }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
