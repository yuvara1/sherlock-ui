import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router"
import { motion, AnimatePresence } from "motion/react"
import {
  Search,
  LayoutDashboard,
  AlertTriangle,
  Terminal,
  GitBranch,
  ScrollText,
  BarChart3,
  Server,
  Brain,
  Settings,
  Network,
  Layers,
  Rocket,
  XCircle,
  ArrowRight,
  Hash,
  Zap,
} from "lucide-react"
import { useAppStore } from "@/stores/appStore"
import { MOCK_SERVICES, MOCK_INCIDENTS, MOCK_ERROR_GROUPS } from "@/mocks/data"
/* ── Result shape ────────────────────────────────────────── */
interface Result {
  id: string
  group: string
  label: string
  sublabel?: string
  icon: React.ReactNode
  badge?: {
    text: string
    color: string
  }
  action: () => void
}
/* ── Static nav items ────────────────────────────────────── */
const NAV_ITEMS = [
  {
    label: "Overview",
    to: "/app/overview",
    icon: <LayoutDashboard size={13} />,
  },
  { label: "Projects", to: "/app/projects", icon: <Layers size={13} /> },
  {
    label: "Incidents",
    to: "/app/incidents",
    icon: <AlertTriangle size={13} />,
  },
  { label: "Errors", to: "/app/errors", icon: <XCircle size={13} /> },
  { label: "Traces", to: "/app/traces", icon: <GitBranch size={13} /> },
  { label: "Logs", to: "/app/logs", icon: <ScrollText size={13} /> },
  { label: "Metrics", to: "/app/metrics", icon: <BarChart3 size={13} /> },
  { label: "Services", to: "/app/services", icon: <Server size={13} /> },
  {
    label: "Dependencies",
    to: "/app/dependencies",
    icon: <Network size={13} />,
  },
  { label: "Deployments", to: "/app/deployments", icon: <Rocket size={13} /> },
  { label: "APIs", to: "/app/apis", icon: <Terminal size={13} /> },
  { label: "AI Debugger", to: "/app/ai", icon: <Brain size={13} /> },
  { label: "Settings", to: "/app/settings", icon: <Settings size={13} /> },
]
const SEVERITY_COLOR: Record<string, string> = {
  CRITICAL: "var(--red)",
  HIGH: "#f97316",
  MEDIUM: "var(--yellow)",
  LOW: "var(--green)",
}
const HEALTH_COLOR: Record<string, string> = {
  CRITICAL: "var(--red)",
  DEGRADED: "var(--yellow)",
  HEALTHY: "var(--green)",
}
/* ── Fuzzy match helper ──────────────────────────────────── */
function match(text: string, query: string) {
  return text.toLowerCase().includes(query.toLowerCase())
}
/* ── The palette ─────────────────────────────────────────── */
export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const [query, setQuery] = useState("")
  const [cursor, setCursor] = useState(0)
  const navigate = useNavigate()
  const { projects, setActiveProject } = useAppStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const go = useCallback(
    (to: string) => {
      navigate(to)
      onClose()
    },
    [navigate, onClose],
  )
  /* Build result list from query */
  const results: Result[] = []
  const q = query.trim()
  /* Pages — always shown when query empty or matches */
  const matchedPages = NAV_ITEMS.filter((n) => !q || match(n.label, q))
  matchedPages.forEach((n) =>
    results.push({
      id: `page-${n.to}`,
      group: "Pages",
      label: n.label,
      icon: n.icon,
      action: () => go(n.to),
    }),
  )
  /* Projects */
  projects
    .filter((p) => !q || match(p.name, q))
    .forEach((p) =>
      results.push({
        id: `proj-${p.id}`,
        group: "Projects",
        label: p.name,
        sublabel: `${p.serviceCount} services`,
        icon: <Layers size={13} />,
        badge: {
          text: p.status,
          color:
            p.status === "CRITICAL"
              ? "var(--red)"
              : p.status === "DEGRADED"
                ? "var(--yellow)"
                : "var(--green)",
        },
        action: () => {
          setActiveProject(p.id)
          go("/app/overview")
        },
      }),
    )
  /* Services */
  if (q) {
    MOCK_SERVICES.filter((s) => match(s.name, q))
      .slice(0, 4)
      .forEach((s) =>
        results.push({
          id: `svc-${s.id}`,
          group: "Services",
          label: s.name,
          sublabel: `${s.language} · err ${s.errorRate}%`,
          icon: <Server size={13} />,
          badge: {
            text: s.health,
            color: HEALTH_COLOR[s.health] ?? "var(--text-4)",
          },
          action: () => go("/app/services"),
        }),
      )
  }
  /* Incidents */
  if (q) {
    MOCK_INCIDENTS.filter((i) => match(i.title, q) || match(i.shortId, q))
      .slice(0, 3)
      .forEach((i) =>
        results.push({
          id: `inc-${i.id}`,
          group: "Incidents",
          label: i.title,
          sublabel: i.shortId,
          icon: <Zap size={13} />,
          badge: {
            text: i.severity,
            color: SEVERITY_COLOR[i.severity] ?? "var(--text-4)",
          },
          action: () => go("/app/incidents"),
        }),
      )
  }
  /* Errors */
  if (q) {
    MOCK_ERROR_GROUPS.filter((e) => match(e.message, q) || match(e.type, q))
      .slice(0, 3)
      .forEach((e) =>
        results.push({
          id: `err-${e.id}`,
          group: "Errors",
          label: e.message,
          sublabel: e.type,
          icon: <Hash size={13} />,
          badge: {
            text: e.severity,
            color: SEVERITY_COLOR[e.severity] ?? "var(--text-4)",
          },
          action: () => go("/app/errors"),
        }),
      )
  }
  /* Clamp cursor */
  const total = results.length
  useEffect(() => {
    setCursor(0)
  }, [query])
  /* Focus input on open */
  useEffect(() => {
    if (open) {
      setQuery("")
      setCursor(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])
  /* Keyboard navigation */
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
        return
      }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setCursor((c) => Math.min(c + 1, total - 1))
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setCursor((c) => Math.max(c - 1, 0))
      }
      if (e.key === "Enter" && results[cursor]) {
        results[cursor].action()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [open, cursor, results, total, onClose])
  /* Scroll active item into view */
  useEffect(() => {
    const el = listRef.current?.querySelector(
      `[data-idx="${cursor}"]`,
    ) as HTMLElement | null
    el?.scrollIntoView({ block: "nearest" })
  }, [cursor])
  /* Group the results */
  const groups: {
    label: string
    items: Result & {
      idx: number
    }[]
  }[] = []
  let idx = 0
  const grouped: Record<string, Result & {
    idx: number
  }[]> = {}
  for (const r of results) {
    if (!grouped[r.group]) grouped[r.group] = []
    grouped[r.group].push({ ...r, idx: idx++ })
  }
  for (const [label, items] of Object.entries(grouped)) {
    groups.push({ label, items })
  }
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={onClose}
            className="[position:fixed] [inset:0] [z-index:1000] [background:rgba(0,0,0,0.5)] [backdrop-filter:blur(2px)]"
          />

          {/* Panel — outer div handles centering, motion.div handles animation */}
          <div className="[position:fixed] [inset:0] [z-index:1001] [display:flex] [align-items:center] [justify-content:center] [pointer-events:none]">
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.14, ease: "easeOut" }}
              className="[pointer-events:auto] [width:min(560px,_calc(100vw_-_32px))] [background:var(--bg-2)] [border:1px_solid_var(--border-2)] [border-radius:12px] [box-shadow:0_24px_80px_rgba(0,0,0,0.28),_0_4px_16px_rgba(0,0,0,0.16)] [overflow:hidden] [font-family:Geist,_sans-serif]"
            >
              {/* Input row */}
              <div className="[display:flex] [align-items:center] [gap:10px] [padding:12px_14px] [border-bottom:1px_solid_var(--border)]">
                <Search
                  size={14}
                  className="[color:var(--text-4)] [flex-shrink:0]"
                />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search pages, projects, services, incidents…"
                  className="[flex:1] [background:transparent] [border:none] [outline:none] [font-size:14px] [color:var(--text-1)] [letter-spacing:-0.006em] [font-family:Geist,_sans-serif]"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="[background:none] [border:none] [cursor:pointer] [color:var(--text-4)] [padding:0] [line-height:1]"
                  >
                    <XCircle size={13} />
                  </button>
                )}
                <kbd className="[font-size:11px] [font-family:Geist_Mono,_monospace] [padding:2px_6px] [border-radius:5px] [border:1px_solid_var(--border-2)] [color:var(--text-4)] [background:var(--bg-3)] [flex-shrink:0]">
                  Esc
                </kbd>
              </div>

              {/* Results */}
              <div
                ref={listRef}
                className="[max-height:380px] [overflow-y:auto] [padding:6px_6px]"
              >
                {groups.length === 0 ? (
                  <div className="[padding:32px_16px] [text-align:center] [color:var(--text-4)] [font-size:13px]">
                    No results for "{query}"
                  </div>
                ) : (
                  groups.map((group) => (
                    <div key={group.label}>
                      {/* Group label */}
                      <div className="[padding:6px_10px_3px] [font-size:10px] [font-weight:600] [letter-spacing:0.06em] [text-transform:uppercase] [color:var(--text-4)] [font-family:Geist_Mono,_monospace]">
                        {group.label}
                      </div>
                      {group.items.map((item) => {
                        const active = item.idx === cursor
                        return (
                          <button
                            key={item.id}
                            data-idx={item.idx}
                            onClick={item.action}
                            onMouseEnter={() => setCursor(item.idx)}
                            className={[
                              "[display:flex] [align-items:center] [gap:10px] [width:100%] [padding:8px_10px] [border-radius:7px] [border:none] [cursor:pointer] [text-align:left] [transition:background_0.08s]",
                              active
                                ? "[background:var(--bg-3)]"
                                : "[background:transparent]",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            {/* Icon */}
                            <span
                              className={[
                                "[flex-shrink:0] [display:flex]",
                                active
                                  ? "[color:var(--text-2)]"
                                  : "[color:var(--text-4)]",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            >
                              {item.icon}
                            </span>

                            {/* Text */}
                            <span className="[flex:1] [min-width:0]">
                              <span className="[font-size:13px] [font-weight:500] [color:var(--text-1)] [letter-spacing:-0.004em] [display:block] [white-space:nowrap] [overflow:hidden] [text-overflow:ellipsis]">
                                {item.label}
                              </span>
                              {item.sublabel && (
                                <span className="[font-size:11px] [color:var(--text-4)] [font-family:Geist_Mono,_monospace] [display:block] [white-space:nowrap] [overflow:hidden] [text-overflow:ellipsis]">
                                  {item.sublabel}
                                </span>
                              )}
                            </span>

                            {/* Badge */}
                            {item.badge && (
                              <span
                                style={{
                                  background: `color-mix(in srgb, ${item.badge.color} 14%, transparent)`,
                                  color: item.badge.color,
                                }}
                                className="[font-size:10px] [font-weight:600] [letter-spacing:0.04em] [font-family:Geist_Mono,_monospace] [padding:2px_6px] [border-radius:4px] [flex-shrink:0]"
                              >
                                {item.badge.text}
                              </span>
                            )}

                            {/* Arrow */}
                            {active && (
                              <ArrowRight
                                size={11}
                                className="[color:var(--text-4)] [flex-shrink:0]"
                              />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer hints */}
              <div className="[border-top:1px_solid_var(--border)] [padding:8px_14px] [display:flex] [gap:16px] [align-items:center]">
                {[
                  ["↑↓", "navigate"],
                  ["↵", "open"],
                  ["Esc", "close"],
                ].map(([key, hint]) => (
                  <span
                    key={key}
                    className="[display:flex] [align-items:center] [gap:5px] [font-size:11px] [color:var(--text-4)]"
                  >
                    <kbd className="[font-family:Geist_Mono,_monospace] [font-size:10px] [padding:1px_5px] [border-radius:4px] [border:1px_solid_var(--border-2)] [background:var(--bg-3)] [color:var(--text-3)]">
                      {key}
                    </kbd>
                    {hint}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
