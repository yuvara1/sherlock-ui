/**
 * Aceternity UI — Infinite Moving Cards
 * Horizontally scrolling marquee of quote cards with configurable speed/direction.
 */
import { cn } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"
interface Item {
  quote: string
  name: string
  title: string
}
interface Props {
  items: Item[]
  direction?: "left" | "right"
  speed?: "fast" | "normal" | "slow"
  pauseOnHover?: boolean
  className?: string
}
export function InfiniteMovingCards({
  items,
  direction = "left",
  speed = "slow",
  pauseOnHover = true,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLUListElement>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!containerRef.current || !scrollerRef.current) return
    // Duplicate items so the scroll loops seamlessly
    const scroller = scrollerRef.current
    const items = Array.from(scroller.children)
    items.forEach((item) => scroller.appendChild(item.cloneNode(true)))
    // Direction
    containerRef.current.style.setProperty(
      "--animation-direction",
      direction === "right" ? "reverse" : "normal",
    )
    // Speed
    const dur = speed === "fast" ? "20s" : speed === "normal" ? "40s" : "80s"
    containerRef.current.style.setProperty("--animation-duration", dur)
    setReady(true)
  }, [direction, speed])
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
          ready &&
            "animate-[scroll_var(--animation-duration)_linear_infinite_var(--animation-direction)]",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {items.map((item, idx) => (
          <li
            key={idx}
            className="relative flex-shrink-0 w-[340px] md:w-[420px] rounded-2xl border px-8 py-6 [background:linear-gradient(135deg,_rgba(255,255,255,0.04)_0%,_rgba(255,255,255,0.01)_100%)] [border-color:rgba(255,255,255,0.07)] [backdrop-filter:blur(8px)]"
          >
            {/* Top accent line */}
            <span className="absolute inset-x-0 top-0 h-px [background:linear-gradient(90deg,_transparent,_rgba(96,165,250,0.4),_transparent)]" />

            {/* Quote mark */}
            <span
              aria-hidden
              className="[position:absolute] [top:16px] [left:22px] [font-size:72px] [line-height:1] [font-family:Georgia,_serif] [color:rgba(96,165,250,0.12)] [font-weight:700] [pointer-events:none] [user-select:none]"
            >
              "
            </span>

            <blockquote>
              <p className="relative z-20 text-sm leading-[1.72] font-normal [color:rgba(255,255,255,0.52)] [letter-spacing:-0.003em]">
                {item.quote}
              </p>

              <footer className="relative z-20 mt-6 flex items-center gap-3">
                <div className="flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold [width:32px] [height:32px] [background:rgba(0,112,243,0.2)] [border:1px_solid_rgba(0,112,243,0.35)] [color:#60a5fa] [font-family:Geist_Mono,_monospace]">
                  {item.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <p className="font-semibold text-sm [color:#ededed] [letter-spacing:-0.006em]">
                    {item.name}
                  </p>
                  <p className="text-xs [color:rgba(255,255,255,0.32)] [margin-top:1px]">
                    {item.title}
                  </p>
                </div>
              </footer>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  )
}
