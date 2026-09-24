/**
 * Aceternity UI — Grid & Dot Background
 * Subtle repeating grid pattern behind page content.
 */
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  dots?: boolean;
}

export function GridBackground({ className, dots = false }: Props) {
  return (
    <div
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={
        dots
          ? {
              backgroundImage:
                "radial-gradient(var(--border-2) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }
          : {
              backgroundImage:
                "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(to right, var(--border) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }
      }
    />
  );
}
