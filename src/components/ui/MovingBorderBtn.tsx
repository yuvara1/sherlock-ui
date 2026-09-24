/**
 * Aceternity UI — Moving Border Button
 * Conic gradient border that rotates around the button edge.
 */
import { cn } from "@/lib/utils";
import type React from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  duration?: number;
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
      className={cn("relative inline-flex overflow-hidden rounded-xl p-[1.5px] focus-visible:outline-none", className)}
      style={{ cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.5 : 1 }}
    >
      {/* Spinning conic gradient */}
      <span
        className="absolute inset-[-1000%]"
        style={{
          background: "conic-gradient(from 90deg at 50% 50%, #0070f3 0%, #7c3aed 30%, #06b6d4 60%, #0070f3 100%)",
          animation: `conic-spin ${duration}s linear infinite`,
        }}
      />
      {/* Inner content */}
      <span
        className={cn(
          "relative z-10 flex w-full items-center justify-center gap-2 rounded-[10px] px-6 py-3 text-sm font-semibold text-white backdrop-blur-3xl",
          innerClassName,
        )}
        style={{ background: "#000", letterSpacing: "-0.004em" }}
      >
        {children}
      </span>
    </button>
  );
}
