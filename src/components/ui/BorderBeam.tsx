/**
 * Aceternity UI — Border Beam
 * Animated travelling light that traces a card's border.
 */
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  size?: number;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
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
        className="absolute inset-0 rounded-[inherit] [border:var(--border-width)_solid_transparent]"
        style={{
          background: `linear-gradient(var(--bg), var(--bg)) padding-box,
            conic-gradient(from calc(var(--angle, 0deg)), var(--color-from), var(--color-to) 10%, var(--color-from) 20%) border-box`,
          animation: `border-beam-spin ${duration}s linear infinite`,
          animationDelay: `${delay}s`,
        }}
      />
    </div>
  );
}

/* inject keyframes once */
const STYLE_ID = "border-beam-keyframes";
if (typeof document !== "undefined" && !document.getElementById(STYLE_ID)) {
  const s = document.createElement("style");
  s.id = STYLE_ID;
  s.textContent = `@property --angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
@keyframes border-beam-spin { to { --angle: 360deg; } }`;
  document.head.appendChild(s);
}

import type React from "react";
