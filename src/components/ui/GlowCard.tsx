/**
 * Aceternity UI — Card Spotlight / Glowing Effect
 * Mouse-tracking radial glow inside a card on hover.
 */
import { useRef, type ReactNode, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function GlowCard({ children, className, style }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--x", `${x}px`);
    el.style.setProperty("--y", `${y}px`);
  }

  function handleMouseLeave() {
    ref.current?.style.removeProperty("--x");
    ref.current?.style.removeProperty("--y");
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative overflow-hidden rounded-xl border transition-colors duration-200",
        "border-[var(--border)] hover:border-[var(--border-2)]",
        "bg-[var(--bg-2)]",
        className,
      )}
      style={
        {
          "--x": "-9999px",
          "--y": "-9999px",
          ...style,
        } as React.CSSProperties
      }
    >
      {/* radial spotlight follows cursor */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "radial-gradient(300px circle at var(--x) var(--y), var(--glow), transparent 70%)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

import type React from "react";
