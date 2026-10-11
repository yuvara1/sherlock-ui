import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"

export type HoldButtonSize = "sm" | "md" | "lg"
export type HoldButtonDirection = "right" | "up"

export interface HoldButtonProps {
  children?: ReactNode
  doneLabel?: ReactNode
  icon?: ReactNode
  doneIcon?: ReactNode
  backgroundColor?: string
  fillColor?: string
  textColor?: string
  fillTextColor?: string
  size?: HoldButtonSize
  radius?: number
  fillDirection?: HoldButtonDirection
  holdTime?: number
  releaseTime?: number
  pressScale?: number
  wave?: boolean
  waveAmplitude?: number
  glow?: boolean
  resetAfter?: number
  disabled?: boolean
  onHold?: () => void
  onTap?: () => void
  className?: string
}

type Phase = "idle" | "holding" | "done"
type Input = "pointer" | "key" | null

interface Motion {
  raf: number
  p: number
  from: number
  to: number
  start: number
}

interface Gesture {
  pointerId: number | null
  start: number
  rect: DOMRect | null
}

interface ReleaseOptions {
  drifted?: boolean
}

const TAP_MS = 250
const HIT_PAD = 10
const LINEAR = (t: number) => t
const EASE_OUT = (t: number) => 1 - Math.pow(1 - t, 3)

const SIZES: Record<HoldButtonSize, string> = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-[22px] text-[15px]",
  lg: "h-[52px] px-7 text-[17px]",
}

const LABEL_SPAN =
  "[grid-area:1/1] inline-flex items-center gap-2 whitespace-nowrap [transition:opacity_200ms_ease,filter_200ms_ease]"

const STYLE = `
.hb-root{--hb-w:0px;--hb-h:0px;--hb-cycles:2;--hb-p:0}
.hb-fill{clip-path:inset(0 calc((1 - var(--hb-p)) * (100% + .75 * var(--hb-wave)) - var(--hb-p) * .25 * var(--hb-wave)) 0 0)}
.hb-root[data-direction=up] .hb-fill{clip-path:inset(calc((1 - var(--hb-p)) * (100% + .75 * var(--hb-wave)) - var(--hb-p) * .25 * var(--hb-wave)) 0 0 0)}
.hb-crest{-webkit-mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='200' viewBox='0 0 20 200' preserveAspectRatio='none'%3E%3Cpath d='M0 0H10C18 8 18 25.3 10 33.3S2 58.7 10 66.7S18 92 10 100S2 125.3 10 133.3S18 158.7 10 166.7S2 192 10 200H0Z'/%3E%3C/svg%3E");mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='200' viewBox='0 0 20 200' preserveAspectRatio='none'%3E%3Cpath d='M0 0H10C18 8 18 25.3 10 33.3S2 58.7 10 66.7S18 92 10 100S2 125.3 10 133.3S18 158.7 10 166.7S2 192 10 200H0Z'/%3E%3C/svg%3E");-webkit-mask-repeat:repeat-y;mask-repeat:repeat-y;-webkit-mask-size:var(--hb-wave) calc(var(--hb-h) * 2);mask-size:var(--hb-wave) calc(var(--hb-h) * 2);-webkit-mask-position-x:calc(-1 * var(--hb-wave) + var(--hb-p) * (var(--hb-w) + var(--hb-wave)));mask-position-x:calc(-1 * var(--hb-wave) + var(--hb-p) * (var(--hb-w) + var(--hb-wave)));-webkit-mask-position-y:calc(-1 * var(--hb-p) * var(--hb-cycles) * var(--hb-h));mask-position-y:calc(-1 * var(--hb-p) * var(--hb-cycles) * var(--hb-h))}
.hb-root[data-direction=up] .hb-crest{-webkit-mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='20' viewBox='0 0 200 20' preserveAspectRatio='none'%3E%3Cpath d='M0 20V10C12 2 38 2 50 10S88 18 100 10S138 2 150 10S188 18 200 10V20Z'/%3E%3C/svg%3E");mask-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='20' viewBox='0 0 200 20' preserveAspectRatio='none'%3E%3Cpath d='M0 20V10C12 2 38 2 50 10S88 18 100 10S138 2 150 10S188 18 200 10V20Z'/%3E%3C/svg%3E");-webkit-mask-repeat:repeat-x;mask-repeat:repeat-x;-webkit-mask-size:calc(var(--hb-w) * 2) var(--hb-wave);mask-size:calc(var(--hb-w) * 2) var(--hb-wave);-webkit-mask-position-x:calc(-1 * var(--hb-p) * var(--hb-cycles) * var(--hb-w));mask-position-x:calc(-1 * var(--hb-p) * var(--hb-cycles) * var(--hb-w));-webkit-mask-position-y:calc(var(--hb-h) - var(--hb-p) * (var(--hb-h) + var(--hb-wave)));mask-position-y:calc(var(--hb-h) - var(--hb-p) * (var(--hb-h) + var(--hb-wave)))}
.hb-root[data-glow=true][data-phase=holding],.hb-root[data-glow=true][data-phase=done]{box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 10px 32px -6px color-mix(in srgb,var(--hb-fill) 70%,transparent)}
.hb-root[data-glow=true][data-phase=holding]{transition:transform 160ms var(--hb-ease-out),background-color 160ms ease,box-shadow var(--hb-hold) linear}
@keyframes hb-pulse{from{opacity:1;box-shadow:0 0 0 0 color-mix(in srgb,var(--hb-fill) 55%,transparent)}to{opacity:0;box-shadow:0 0 0 14px color-mix(in srgb,var(--hb-fill) 0%,transparent)}}
@media (prefers-reduced-motion:reduce){
.hb-root{transform:none!important;transition:background-color 160ms ease,box-shadow var(--hb-release) ease!important}
.hb-fill{clip-path:inset(0)!important;opacity:0;transition:opacity var(--hb-release) ease!important}
.hb-crest{display:none}
.hb-root[data-phase=holding] .hb-fill,.hb-root[data-phase=done] .hb-fill{opacity:1;transition:opacity var(--hb-hold) linear!important}
.hb-pulse{animation:none!important}
.hb-label>span{filter:none!important;transition:opacity 200ms ease!important}
}`

export default function HoldButton({
  children = "Hold to delete",
  doneLabel = "Deleted",
  icon = null,
  doneIcon = null,
  backgroundColor = "#27272a",
  fillColor = "#5227FF",
  textColor = "#f5f5f5",
  fillTextColor = "#ffffff",
  size = "md",
  radius = 14,
  fillDirection = "right",
  holdTime = 2000,
  releaseTime = 200,
  pressScale = 0.97,
  wave = true,
  waveAmplitude = 6,
  glow = true,
  resetAfter = 1200,
  disabled = false,
  onHold,
  onTap,
  className = "",
}: HoldButtonProps) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [input, setInput] = useState<Input>(null)
  const phaseRef = useRef<Phase>("idle")
  const inputRef = useRef<Input>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const gesture = useRef<Gesture>({
    pointerId: null,
    start: 0,
    rect: null,
  })
  const timers = useRef({ complete: 0, reset: 0 })
  const motion = useRef<Motion>({ raf: 0, p: 0, from: 0, to: 0, start: 0 })
  const hintId = useId()

  const go = (next: Phase, kind: Input = null) => {
    phaseRef.current = next
    inputRef.current = kind
    setPhase(next)
    setInput(kind)
  }

  const clearTimers = () => {
    clearTimeout(timers.current.complete)
    clearTimeout(timers.current.reset)
  }

  const complete = () => {
    if (phaseRef.current !== "holding") return
    if (performance.now() - gesture.current.start < holdTime - 50) return
    clearTimers()
    go("done", inputRef.current)
    onHold?.()
    if (resetAfter > 0) {
      timers.current.reset = window.setTimeout(() => {
        go("idle")
        drive(0, releaseTime, EASE_OUT)
      }, resetAfter)
    }
  }

  const drive = (
    to: number,
    duration: number,
    ease: (t: number) => number,
  ) => {
    const current = motion.current
    cancelAnimationFrame(current.raf)
    current.from = current.p
    current.to = to
    current.start = performance.now()
    const step = (now: number) => {
      const time =
        duration > 0 ? Math.min(1, (now - current.start) / duration) : 1
      current.p = current.from + (current.to - current.from) * ease(time)
      buttonRef.current?.style.setProperty("--hb-p", current.p.toFixed(4))
      if (time < 1) {
        current.raf = requestAnimationFrame(step)
        return
      }
      current.raf = 0
      if (current.to === 1) complete()
    }
    current.raf = requestAnimationFrame(step)
  }

  const begin = (kind: Input) => {
    if (disabled || phaseRef.current !== "idle" || !buttonRef.current)
      return false
    gesture.current.start = performance.now()
    gesture.current.rect = buttonRef.current.getBoundingClientRect()
    go("holding", kind)
    drive(1, holdTime, LINEAR)
    timers.current.complete = window.setTimeout(complete, holdTime + 100)
    return true
  }

  const release = ({ drifted = false }: ReleaseOptions = {}) => {
    if (phaseRef.current !== "holding") return
    clearTimers()
    const held = performance.now() - gesture.current.start
    go("idle")
    drive(0, releaseTime, EASE_OUT)
    if (!drifted && held < TAP_MS) onTap?.()
  }
  const releaseRef = useRef(release)
  releaseRef.current = release

  const endPointer = (
    event: React.PointerEvent<HTMLButtonElement>,
    options?: ReleaseOptions,
  ) => {
    if (event.pointerId !== gesture.current.pointerId) return
    gesture.current.pointerId = null
    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId))
        event.currentTarget.releasePointerCapture(event.pointerId)
    } catch {
      // Pointer capture may already be released by the browser.
    }
    release(options)
  }

  useLayoutEffect(() => {
    const button = buttonRef.current
    if (!button) return
    const measure = () => {
      button.style.setProperty("--hb-w", `${button.offsetWidth}px`)
      button.style.setProperty("--hb-h", `${button.offsetHeight}px`)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(button)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (phase !== "holding") return
    const cancel = () => releaseRef.current({ drifted: true })
    const onVisibility = () => {
      if (document.hidden) cancel()
    }
    window.addEventListener("blur", cancel)
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      window.removeEventListener("blur", cancel)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [phase])

  useEffect(() => {
    const currentTimers = timers.current
    const currentMotion = motion.current
    return () => {
      clearTimeout(currentTimers.complete)
      clearTimeout(currentTimers.reset)
      cancelAnimationFrame(currentMotion.raf)
    }
  }, [])

  const direction: HoldButtonDirection =
    fillDirection === "up" ? "up" : "right"
  const label = (
    <>
      <span
        className={`${LABEL_SPAN} group-data-[phase=done]:opacity-0 group-data-[phase=done]:blur-[2px]`}
        aria-hidden={phase === "done"}
      >
        {icon ? (
          <span className="inline-flex flex-none [&>svg]:block">{icon}</span>
        ) : null}
        {children}
      </span>
      <span
        className={`${LABEL_SPAN} opacity-0 blur-[2px] group-data-[phase=done]:opacity-100 group-data-[phase=done]:blur-0`}
        aria-hidden={phase !== "done"}
      >
        {doneIcon ? (
          <span className="inline-flex flex-none [&>svg]:block">{doneIcon}</span>
        ) : null}
        {doneLabel}
      </span>
    </>
  )

  const cssVariables = {
    "--hb-radius": `${radius}px`,
    "--hb-bg": backgroundColor,
    "--hb-fill": fillColor,
    "--hb-text": textColor,
    "--hb-fill-text": fillTextColor,
    "--hb-hold": `${holdTime}ms`,
    "--hb-cycles": holdTime / 1100,
    "--hb-release": `${releaseTime}ms`,
    "--hb-press": pressScale,
    "--hb-wave": `${wave ? waveAmplitude : 0}px`,
    "--hb-ease-out": "cubic-bezier(0.23, 1, 0.32, 1)",
  } as CSSProperties

  return (
    <button
      ref={buttonRef}
      type="button"
      disabled={disabled}
      className={`hb-root group relative isolate m-0 inline-grid cursor-pointer touch-manipulation select-none place-items-center border-0 font-medium leading-none outline-none [-webkit-tap-highlight-color:transparent] [background:var(--hb-bg)] [border-radius:var(--hb-radius)] [color:var(--hb-text)] shadow-sm [transition:transform_160ms_var(--hb-ease-out),background-color_160ms_ease,box-shadow_var(--hb-release)_var(--hb-ease-out)] data-[phase=holding]:data-[input=pointer]:[transform:scale(var(--hb-press))] focus-visible:[outline:2px_solid_var(--hb-fill)] focus-visible:outline-offset-2 disabled:pointer-events-none disabled:cursor-default disabled:opacity-50 ${SIZES[size]}${className ? ` ${className}` : ""}`}
      data-phase={phase}
      data-input={input ?? undefined}
      data-direction={direction}
      data-glow={glow ? "true" : undefined}
      aria-describedby={hintId}
      style={cssVariables}
      onPointerDown={(event) => {
        if (
          event.button !== 0 ||
          !event.isPrimary ||
          gesture.current.pointerId !== null ||
          !begin("pointer")
        )
          return
        gesture.current.pointerId = event.pointerId
        try {
          event.currentTarget.setPointerCapture(event.pointerId)
        } catch {
          // Pointer capture is progressive enhancement.
        }
      }}
      onPointerMove={(event) => {
        if (event.pointerId !== gesture.current.pointerId) return
        const rect = gesture.current.rect
        if (!rect) return
        const outside =
          event.clientX < rect.left - HIT_PAD ||
          event.clientX > rect.right + HIT_PAD ||
          event.clientY < rect.top - HIT_PAD ||
          event.clientY > rect.bottom + HIT_PAD
        if (outside) endPointer(event, { drifted: true })
      }}
      onPointerUp={(event) => endPointer(event)}
      onPointerCancel={(event) => endPointer(event, { drifted: true })}
      onLostPointerCapture={(event) => endPointer(event, { drifted: true })}
      onPointerLeave={(event) => {
        if (event.pointerType !== "touch")
          endPointer(event, { drifted: true })
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          if (inputRef.current === "key") release({ drifted: true })
          return
        }
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault()
          if (!event.repeat) begin("key")
        }
      }}
      onKeyUp={(event) => {
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault()
          if (inputRef.current === "key") release()
        }
      }}
      onContextMenu={(event) => event.preventDefault()}
    >
      <style>{STYLE}</style>
      <span
        className="hb-pulse pointer-events-none absolute inset-0 z-0 opacity-0 [border-radius:var(--hb-radius)] group-data-[glow=true]:group-data-[phase=done]:[animation:hb-pulse_600ms_var(--hb-ease-out)_forwards]"
        aria-hidden="true"
      />
      <span className="hb-label relative z-[2] grid place-items-center">
        {label}
      </span>
      <span
        className="pointer-events-none absolute inset-0 z-[3] [clip-path:inset(0_round_var(--hb-radius))]"
        aria-hidden="true"
      >
        <span className="hb-fill absolute inset-0 grid place-items-center [background:var(--hb-fill)] [color:var(--hb-fill-text)]">
          <span className="hb-label grid place-items-center">{label}</span>
        </span>
        <span className="hb-crest absolute inset-0 grid place-items-center [background:var(--hb-fill)] [color:var(--hb-fill-text)]">
          <span className="hb-label grid place-items-center">{label}</span>
        </span>
      </span>
      <span
        id={hintId}
        className="absolute h-px w-px overflow-hidden whitespace-nowrap [clip-path:inset(50%)]"
      >
        Press and hold for {Math.round(holdTime / 100) / 10} seconds to confirm
      </span>
    </button>
  )
}
