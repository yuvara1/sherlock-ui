import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ForwardedRef,
} from "react"
import { flushSync } from "react-dom"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type TransitionVariant = "circle" | "square" | "triangle" | "diamond" | "hexagon" | "rectangle" | "star"

interface AnimatedThemeTogglerProps
  extends Omit<ComponentPropsWithoutRef<"button">, "onChange"> {
  duration?: number
  variant?: TransitionVariant
  fromCenter?: boolean
  theme?: "light" | "dark"
  onThemeChange?: (theme: "light" | "dark") => void
}

function polygonCollapsed(point: string, vertexCount: number) {
  return `polygon(${Array.from({ length: vertexCount }, () => point).join(", ")})`
}

function getThemeTransitionClipPaths(
  variant: TransitionVariant,
  cx: number,
  cy: number,
  maxRadius: number,
  viewportWidth: number,
  viewportHeight: number,
): [string, string] {
  const toX = (x: number) => `${(x / viewportWidth) * 100}%`
  const toY = (y: number) => `${(y / viewportHeight) * 100}%`
  const point = (x: number, y: number) => `${toX(x)} ${toY(y)}`
  const toRadius = (radius: number) =>
    `${(radius / (Math.hypot(viewportWidth, viewportHeight) / Math.SQRT2)) * 100}%`
  const center = point(cx, cy)

  switch (variant) {
    case "circle":
      return [
        `circle(0% at ${center})`,
        `circle(${toRadius(maxRadius)} at ${center})`,
      ]
    case "square": {
      const halfSide =
        Math.max(
          Math.max(cx, viewportWidth - cx),
          Math.max(cy, viewportHeight - cy),
        ) * 1.05
      const end = [
        point(cx - halfSide, cy - halfSide),
        point(cx + halfSide, cy - halfSide),
        point(cx + halfSide, cy + halfSide),
        point(cx - halfSide, cy + halfSide),
      ].join(", ")
      return [polygonCollapsed(center, 4), `polygon(${end})`]
    }
    case "triangle": {
      const scale = maxRadius * 2.2
      const dx = (Math.sqrt(3) / 2) * scale
      const end = [
        point(cx, cy - scale),
        point(cx + dx, cy + 0.5 * scale),
        point(cx - dx, cy + 0.5 * scale),
      ].join(", ")
      return [polygonCollapsed(center, 3), `polygon(${end})`]
    }
    case "diamond": {
      const radius = maxRadius * Math.SQRT2
      const end = [
        point(cx, cy - radius),
        point(cx + radius, cy),
        point(cx, cy + radius),
        point(cx - radius, cy),
      ].join(", ")
      return [polygonCollapsed(center, 4), `polygon(${end})`]
    }
    case "hexagon": {
      const radius = maxRadius * Math.SQRT2
      const vertices = Array.from({ length: 6 }, (_, index) => {
        const angle = -Math.PI / 2 + (index * Math.PI) / 3
        return point(
          cx + radius * Math.cos(angle),
          cy + radius * Math.sin(angle),
        )
      })
      return [polygonCollapsed(center, 6), `polygon(${vertices.join(", ")})`]
    }
    case "rectangle": {
      const halfWidth = Math.max(cx, viewportWidth - cx)
      const halfHeight = Math.max(cy, viewportHeight - cy)
      const end = [
        point(cx - halfWidth, cy - halfHeight),
        point(cx + halfWidth, cy - halfHeight),
        point(cx + halfWidth, cy + halfHeight),
        point(cx - halfWidth, cy + halfHeight),
      ].join(", ")
      return [polygonCollapsed(center, 4), `polygon(${end})`]
    }
    case "star": {
      const radius = maxRadius * Math.SQRT2 * 1.03
      const star = (size: number) => {
        const vertices: string[] = []
        for (let index = 0; index < 5; index++) {
          const outerAngle = -Math.PI / 2 + (index * 2 * Math.PI) / 5
          const innerAngle = outerAngle + Math.PI / 5
          vertices.push(
            point(
              cx + size * Math.cos(outerAngle),
              cy + size * Math.sin(outerAngle),
            ),
            point(
              cx + size * 0.42 * Math.cos(innerAngle),
              cy + size * 0.42 * Math.sin(innerAngle),
            ),
          )
        }
        return `polygon(${vertices.join(", ")})`
      }
      return [star(Math.max(2, radius * 0.025)), star(radius)]
    }
  }
}

function assignRef(
  ref: ForwardedRef<HTMLButtonElement>,
  node: HTMLButtonElement | null,
) {
  if (typeof ref === "function") ref(node)
  else if (ref) ref.current = node
}

export const AnimatedThemeToggler =
  forwardRef<HTMLButtonElement, AnimatedThemeTogglerProps>(
    function AnimatedThemeToggler(
      {
        className,
        duration = 400,
        variant = "circle",
        fromCenter = false,
        theme,
        onThemeChange,
        onClick,
        disabled,
        ...props
      },
      forwardedRef,
    ) {
      const controlled = theme !== undefined
      const [internalIsDark, setInternalIsDark] = useState(false)
      const isDark = controlled ? theme === "dark" : internalIsDark
      const buttonRef = useRef<HTMLButtonElement | null>(null)
      const transitioningRef = useRef(false)
      const animationRef = useRef<Animation | null>(null)

      const setButtonRef = useCallback(
        (node: HTMLButtonElement | null) => {
          buttonRef.current = node
          assignRef(forwardedRef, node)
        },
        [forwardedRef],
      )

      const cancelAnimation = useCallback(() => {
        animationRef.current?.cancel()
        animationRef.current = null
      }, [])

      useEffect(() => {
        if (controlled) return
        const updateTheme = () =>
          setInternalIsDark(document.documentElement.classList.contains("dark"))
        updateTheme()
        const observer = new MutationObserver(updateTheme)
        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["class"],
        })
        return () => observer.disconnect()
      }, [controlled])

      useEffect(
        () => () => {
          cancelAnimation()
          const root = document.documentElement
          if (root.dataset.magicuiThemeVt !== "active") return
          delete root.dataset.magicuiThemeVt
          root.style.removeProperty("--magicui-theme-toggle-vt-duration")
          root.style.removeProperty("--magicui-theme-vt-clip-from")
        },
        [cancelAnimation],
      )

      const toggleTheme = useCallback(() => {
        const button = buttonRef.current
        const root = document.documentElement
        if (
          !button ||
          disabled ||
          transitioningRef.current ||
          root.dataset.magicuiThemeVt === "active"
        )
          return

        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const rect = button.getBoundingClientRect()
        const x = fromCenter ? viewportWidth / 2 : rect.left + rect.width / 2
        const y = fromCenter ? viewportHeight / 2 : rect.top + rect.height / 2
        const maxRadius = Math.hypot(
          Math.max(x, viewportWidth - x),
          Math.max(y, viewportHeight - y),
        )
        const nextTheme = isDark ? "light" : "dark"
        const applyTheme = () => {
          root.classList.toggle("dark", nextTheme === "dark")
          if (controlled) onThemeChange?.(nextTheme)
          else {
            setInternalIsDark(nextTheme === "dark")
            localStorage.setItem("tm-theme", nextTheme)
          }
        }

        if (
          typeof document.startViewTransition !== "function" ||
          window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ) {
          applyTheme()
          return
        }

        const clipPath = getThemeTransitionClipPaths(
          variant,
          x,
          y,
          maxRadius,
          viewportWidth,
          viewportHeight,
        )
        root.dataset.magicuiThemeVt = "active"
        root.style.setProperty(
          "--magicui-theme-toggle-vt-duration",
          `${duration}ms`,
        )
        root.style.setProperty("--magicui-theme-vt-clip-from", clipPath[0])
        transitioningRef.current = true

        const cleanup = () => {
          transitioningRef.current = false
          delete root.dataset.magicuiThemeVt
          root.style.removeProperty("--magicui-theme-toggle-vt-duration")
          root.style.removeProperty("--magicui-theme-vt-clip-from")
          cancelAnimation()
        }
        const transition = document.startViewTransition(() => {
          flushSync(applyTheme)
        })
        transition.finished.finally(cleanup).catch(() => {})
        transition.ready
          .then(() => {
            animationRef.current = root.animate({ clipPath }, {
              duration,
              easing: variant === "star" ? "linear" : "ease-in-out",
              fill: "forwards",
              pseudoElement: "::view-transition-new(root)",
            })
          })
          .catch(cleanup)
      }, [
        controlled,
        disabled,
        duration,
        fromCenter,
        isDark,
        onThemeChange,
        variant,
        cancelAnimation,
      ])

      return (
        <Button
          {...props}
          ref={setButtonRef}
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled}
          aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
          className={cn("relative text-muted-foreground", className)}
          onClick={(event) => {
            toggleTheme()
            onClick?.(event)
          }}
        >
          {isDark ? (
            <Sun size={14} aria-hidden="true" />
          ) : (
            <Moon size={14} aria-hidden="true" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      )
    },
  )
