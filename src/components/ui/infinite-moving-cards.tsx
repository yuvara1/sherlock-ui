/**
 * Aceternity UI — Infinite Moving Cards
 * Horizontally scrolling marquee of quote cards with configurable speed/direction.
 */
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

interface Item {
  quote: string;
  name: string;
  title: string;
}

interface Props {
  items: Item[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}

export function InfiniteMovingCards({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef  = useRef<HTMLUListElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !scrollerRef.current) return;

    // Duplicate items so the scroll loops seamlessly
    const scroller = scrollerRef.current;
    const items    = Array.from(scroller.children);
    items.forEach(item => scroller.appendChild(item.cloneNode(true)));

    // Direction
    containerRef.current.style.setProperty(
      "--animation-direction",
      direction === "right" ? "reverse" : "normal",
    );

    // Speed
    const dur = speed === "fast" ? "20s" : speed === "normal" ? "40s" : "80s";
    containerRef.current.style.setProperty("--animation-duration", dur);

    setReady(true);
  }, [direction, speed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative z-20 overflow-hidden",
        // Fade edges
        "[mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]",
        className,
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-6 py-4 w-max flex-nowrap",
          ready && "animate-[scroll_var(--animation-duration)_linear_infinite_var(--animation-direction)]",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {items.map((item, idx) => (
          <li
            key={idx}
            className="relative flex-shrink-0 w-[340px] md:w-[420px] rounded-2xl border px-8 py-6"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
              borderColor: "rgba(255,255,255,0.07)",
              backdropFilter: "blur(8px)",
            }}
          >
            {/* Top accent line */}
            <span
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(96,165,250,0.4), transparent)" }}
            />

            {/* Quote mark */}
            <span
              aria-hidden
              style={{
                position: "absolute", top: 16, left: 22,
                fontSize: 72, lineHeight: 1, fontFamily: "Georgia, serif",
                color: "rgba(96,165,250,0.12)", fontWeight: 700, pointerEvents: "none",
                userSelect: "none",
              }}
            >
              "
            </span>

            <blockquote>
              <p
                className="relative z-20 text-sm leading-[1.72] font-normal"
                style={{ color: "rgba(255,255,255,0.52)", letterSpacing: "-0.003em" }}
              >
                {item.quote}
              </p>

              <footer className="relative z-20 mt-6 flex items-center gap-3">
                <div
                  className="flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    width: 32, height: 32,
                    background: "rgba(0,112,243,0.2)",
                    border: "1px solid rgba(0,112,243,0.35)",
                    color: "#60a5fa",
                    fontFamily: "Geist Mono, monospace",
                  }}
                >
                  {item.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#ededed", letterSpacing: "-0.006em" }}>
                    {item.name}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.32)", marginTop: 1 }}>
                    {item.title}
                  </p>
                </div>
              </footer>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
}
