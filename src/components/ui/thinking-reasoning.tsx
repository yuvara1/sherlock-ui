import { useEffect, useRef, useState } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ThinkingReasoningProps {
  steps: string[]
  busy?: boolean
}

/** Public activity summary, not a model's private chain of thought. */
export function ThinkingReasoning({
  steps,
  busy = false,
}: ThinkingReasoningProps) {
  const [open, setOpen] = useState(false)
  const viewport = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (busy && viewport.current)
      viewport.current.scrollTop = viewport.current.scrollHeight
  }, [steps, busy])
  const expanded = busy || open
  return (
    <div className="trr-root text-xs text-muted-foreground">
      <Button
        variant="ghost"
        size="sm"
        className="px-0 text-xs"
        aria-expanded={expanded}
        disabled={busy}
        onClick={() => setOpen(!open)}
      >
        <span className={busy ? "trr-shimmer" : ""}>
          {busy ? "Demo activity…" : "Activity summary"}
        </span>
        <ChevronDown
          className={`size-3 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </Button>
      <div className={`trr-collapsible ${expanded ? "" : "trr-collapsed"}`}>
        <div className="overflow-hidden">
          <div
            ref={viewport}
            className="max-h-44 overflow-y-auto border-l border-border pl-3"
          >
            {steps.map((step, i) => (
              <div className="trr-sentence py-1 leading-5" key={`${i}-${step}`}>
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThinkingReasoning
