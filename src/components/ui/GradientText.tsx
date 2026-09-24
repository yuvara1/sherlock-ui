/**
 * React Bits — Gradient Text
 * Applies an animated shimmer gradient to a text node.
 */
import { cn } from "@/lib/utils";
import type React from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
  from?: string;
  via?: string;
  to?: string;
  animate?: boolean;
}

export function GradientText({
  children,
  className,
  from = "#0070f3",
  via = "#7c3aed",
  to = "#06b6d4",
  animate = true,
}: Props) {
  return (
    <span
      className={cn("inline-block bg-clip-text text-transparent", className)}
      style={{
        backgroundImage: `linear-gradient(90deg, ${from}, ${via}, ${to}, ${from})`,
        backgroundSize: animate ? "200% auto" : "100% auto",
        animation: animate ? "shimmer 4s linear infinite" : undefined,
        WebkitBackgroundClip: "text",
      }}
    >
      {children}
    </span>
  );
}

/* Shimmer keyframe is declared in index.css */
