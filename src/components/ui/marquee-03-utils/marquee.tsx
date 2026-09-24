import { cn } from "@/lib/utils";
import { useRef } from "react";
import type React from "react";

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  vertical?: boolean;
  reverse?: boolean;
  pauseOnHover?: boolean;
}

export function Marquee({
  children,
  className,
  vertical = false,
  reverse = false,
  pauseOnHover = false,
}: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const pause  = () => { if (pauseOnHover && trackRef.current) trackRef.current.style.animationPlayState = "paused";  };
  const resume = () => { if (pauseOnHover && trackRef.current) trackRef.current.style.animationPlayState = "running"; };

  return (
    <div
      className={cn(
        "flex overflow-hidden",
        vertical ? "flex-col" : "flex-row",
        className,
      )}
      style={{
        maskImage: vertical
          ? "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)"
          : "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage: vertical
          ? "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)"
          : "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
      onMouseEnter={pause}
      onMouseLeave={resume}
    >
      <div
        ref={trackRef}
        className={cn(
          "flex shrink-0 will-change-transform",
          vertical ? "flex-col" : "flex-row",
          vertical
            ? (reverse ? "animate-marquee-vertical-reverse" : "animate-marquee-vertical")
            : (reverse ? "animate-marquee-reverse" : "animate-marquee"),
        )}
        style={{ gap: vertical ? "12px" : "16px" }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
