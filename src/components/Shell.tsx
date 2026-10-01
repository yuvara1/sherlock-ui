import { useState, useEffect, useRef, useCallback } from "react"
import { NavLink, Outlet, useLocation, useNavigate } from "react-router"
import { motion, AnimatePresence } from "motion/react"
import {
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
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  Menu,
  XCircle,
  Rocket,
  Plus,
  ChevronsUpDown,
  Plug,
  BellRing,
} from "lucide-react"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { useTheme } from "@/lib/theme"
import { useAppStore, useActiveProject } from "@/stores/appStore"
import { SherlockSelect } from "@/components/ui/SherlockSelect"
import WorkspaceConnection from "@/components/workspace/WorkspaceConnection"
import { useAuthStore } from "@/stores/authStore"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { CommandPalette } from "@/components/ui/CommandPalette"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  usePanelRef,
} from "@/components/ui/resizable"
const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { icon: LayoutDashboard, label: "Overview", to: "/app/overview" },
      { icon: Layers, label: "Projects", to: "/app/projects" },
    ],
  },
  {
    label: "Observability",
    items: [
      { icon: AlertTriangle, label: "Incidents", to: "/app/incidents" },
      { icon: XCircle, label: "Errors", to: "/app/errors" },
      { icon: GitBranch, label: "Traces", to: "/app/traces" },
      { icon: ScrollText, label: "Logs", to: "/app/logs" },
      { icon: BarChart3, label: "Metrics", to: "/app/metrics" },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { icon: Server, label: "Services", to: "/app/services" },
      { icon: Network, label: "Dependencies", to: "/app/dependencies" },
      { icon: Rocket, label: "Deployments", to: "/app/deployments" },
    ],
  },
  {
    label: "Tools & Settings",
    items: [
      { icon: Plug, label: "Integrations", to: "/app/integrations" },
      { icon: BellRing, label: "Alerts", to: "/app/alerts" },
      { icon: Terminal, label: "APIs", to: "/app/apis" },
      { icon: Brain, label: "AI Debugger", to: "/app/ai" },
      { icon: Settings, label: "Settings", to: "/app/settings" },
    ],
  },
]
const NAV = NAV_GROUPS.flatMap((group) => group.items)
const SIDEBAR_EXPANDED_PX = 220
const SIDEBAR_COLLAPSED_PX = 48
const COLLAPSE_THRESHOLD_PX = 100 // below this → icon-only mode
/* ── Helpers ────────────────────────────────────────────── */
function StatusDot({ status }: { status: string }) {
  const color =
    status === "CRITICAL"
      ? "var(--red)"
      : status === "DEGRADED"
        ? "var(--yellow)"
        : "var(--green)"
  return (
    <span
      style={{
        background: color,
      }}
      className="[width:6px] [height:6px] [border-radius:50%] [flex-shrink:0] [display:inline-block]"
    />
  )
}
function ProjectIcon({ name, size = 24 }: { name: string; size?: number }) {
  const hue = (name.charCodeAt(0) * 37 + name.charCodeAt(1) * 13) % 360
  return (
    <div
      style={{
        width: size,
        height: size,
        background: `hsl(${hue},60%,18%)`,
        border: `1px solid hsl(${hue},40%,28%)`,
      }}
      className="[border-radius:6px] [flex-shrink:0] [display:flex] [align-items:center] [justify-content:center]"
    >
      <svg
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 16 14"
        fill="none"
      >
        <path d="M8 1L15 13H1L8 1Z" fill={`hsl(${hue},80%,65%)`} />
      </svg>
    </div>
  )
}
/* ── Project Picker ─────────────────────────────────────── */
function ProjectPicker() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const { projects, activeProjectId, setActiveProject } = useAppStore()
  const activeProject = useActiveProject()
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()),
  )
  useEffect(() => {
    if (open) {
      setQuery("")
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    document.addEventListener("keydown", esc)
    return () => {
      document.removeEventListener("mousedown", handler)
      document.removeEventListener("keydown", esc)
    }
  }, [])
  return (
    <div ref={ref} className="[position:relative]">
      <button
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--bg-3)"
          e.currentTarget.style.borderColor = "var(--border)"
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = "transparent"
            e.currentTarget.style.borderColor = "transparent"
          }
        }}
        className={[
          "[display:flex] [align-items:center] [gap:7px] [padding:5px_8px] [border-radius:7px] [border:1px_solid_transparent] [cursor:pointer] [transition:background_0.12s,_border-color_0.12s]",
          open ? "[background:var(--bg-3)]" : "[background:transparent]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <ProjectIcon name={activeProject?.name ?? "A"} size={20} />
        <span className="[font-size:13px] [font-weight:500] [color:var(--text-1)] [letter-spacing:-0.008em] [white-space:nowrap] [max-width:140px] [overflow:hidden] [text-overflow:ellipsis]">
          {activeProject?.name ?? "Select project"}
        </span>
        <ChevronsUpDown
          size={11}
          className="[color:var(--text-4)] [flex-shrink:0]"
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="[position:absolute] [top:calc(100%_+_6px)] [left:0] [width:248px] [background:var(--bg-2)] [border:1px_solid_var(--border)] [border-radius:10px] [box-shadow:0_8px_32px_rgba(0,0,0,0.18),_0_2px_8px_rgba(0,0,0,0.12)] [z-index:999] [overflow:hidden]"
          >
            <div className="[padding:8px_8px_4px]">
              <div className="[display:flex] [align-items:center] [gap:8px] [padding:6px_10px] [border-radius:7px] [background:var(--bg-3)] [border:1px_solid_var(--border)]">
                <Search
                  size={11}
                  className="[color:var(--text-4)] [flex-shrink:0]"
                />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find Project..."
                  className="[flex:1] [background:transparent] [border:none] [outline:none] [font-size:12px] [font-family:Geist,_sans-serif] [color:var(--text-2)] [letter-spacing:-0.004em]"
                />
                <kbd className="[font-size:10px] [font-family:Geist_Mono,_monospace] [padding:1px_5px] [border-radius:4px] [border:1px_solid_var(--border-2)] [color:var(--text-4)] [background:var(--bg)]">
                  Esc
                </kbd>
              </div>
            </div>
            <div className="[padding:4px_8px]">
              {filtered.length === 0 ? (
                <p className="[font-size:12px] [color:var(--text-4)] [padding:10px_8px] [text-align:center]">
                  No projects found
                </p>
              ) : (
                filtered.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      setActiveProject(project.id)
                      setOpen(false)
                      navigate("/app/overview")
                    }}
                    onMouseEnter={(e) => {
                      if (project.id !== activeProjectId)
                        e.currentTarget.style.background = "var(--bg-3)"
                    }}
                    onMouseLeave={(e) => {
                      if (project.id !== activeProjectId)
                        e.currentTarget.style.background = "transparent"
                    }}
                    className={[
                      "[display:flex] [align-items:center] [gap:10px] [width:100%] [padding:7px_8px] [border-radius:7px] [border:none] [cursor:pointer] [transition:background_0.1s] [text-align:left]",
                      project.id === activeProjectId
                        ? "[background:var(--bg-3)]"
                        : "[background:transparent]",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <ProjectIcon name={project.name} size={24} />
                    <div className="[flex:1] [min-width:0]">
                      <p className="[font-size:13px] [font-weight:500] [color:var(--text-1)] [letter-spacing:-0.008em] [margin:0] [white-space:nowrap] [overflow:hidden] [text-overflow:ellipsis]">
                        {project.name}
                      </p>
                      <p className="[font-size:11px] [color:var(--text-4)] [margin:0] [font-family:Geist_Mono,_monospace]">
                        {project.serviceCount} services
                      </p>
                    </div>
                    <StatusDot status={project.status} />
                  </button>
                ))
              )}
            </div>
            <div className="[border-top:1px_solid_var(--border)] [padding:4px_8px_8px]">
              <button
                onClick={() => {
                  setOpen(false)
                  navigate("/app/projects")
                }}
                className="[display:flex] [align-items:center] [gap:10px] [width:100%] [padding:8px_8px] [border-radius:7px] [background:transparent] [border:none] [cursor:pointer] [transition:background_0.1s] hover:[background:var(--bg-3)]"
              >
                <div className="[width:24px] [height:24px] [border-radius:6px] [flex-shrink:0] [border:1px_dashed_var(--border-2)] [display:flex] [align-items:center] [justify-content:center]">
                  <Plus size={11} className="[color:var(--text-3)]" />
                </div>
                <span className="[font-size:13px] [font-weight:500] [color:var(--text-2)] [letter-spacing:-0.008em]">
                  Create Project
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
/* ── Sidebar content ─────────────────────────────────────── */
function SidebarContent({
  collapsed,
  onToggle,
  isMobile = false,
}: {
  collapsed: boolean
  onToggle: () => void
  isMobile?: boolean
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)
  return (
    <div
      className={[
        "[display:flex] [flex-direction:column] [height:100%] [overflow:hidden] [background:var(--bg)]",
        isMobile ? "[border-right:none]" : "[border-right:none]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Logo / brand bar */}
      <div
        className={[
          "[display:flex] [align-items:center] [flex-shrink:0] [height:52px] [padding:0_12px] [border-bottom:1px_solid_var(--border)]",
          collapsed
            ? "[justify-content:center]"
            : "[justify-content:space-between]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="[display:flex] [align-items:center] [gap:8px]"
            >
              <div className="[width:22px] [height:22px] [border-radius:6px] [flex-shrink:0] [background:var(--accent)] [display:flex] [align-items:center] [justify-content:center]">
                <svg width={12} height={11} viewBox="0 0 16 14" fill="none">
                  <path d="M8 1L15 13H1L8 1Z" fill="#fff" />
                </svg>
              </div>
              <span className="[font-size:13px] [font-weight:600] [letter-spacing:-0.02em] [color:var(--text-1)] [white-space:nowrap]">
                Sherlock
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {!isMobile && (
          <button
            onClick={onToggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="[display:flex] [align-items:center] [justify-content:center] [width:20px] [height:20px] [color:var(--text-4)] [background:none] [border:none] [cursor:pointer] [flex-shrink:0] [border-radius:4px] [transition:color_0.1s] hover:[color:var(--text-2)]"
          >
            {collapsed ? (
              <ChevronRight size={12} />
            ) : (
              <ChevronDown size={12} className="[transform:rotate(90deg)]" />
            )}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="[flex:1] [padding:8px] [overflow-y:auto] [overflow-x:hidden]">
        {NAV_GROUPS.map((group) => (
          <section
            key={group.label}
            className={[
              group.label === "Workspace"
                ? "[margin-top:0]"
                : "[margin-top:12px]",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {!collapsed && (
              <div className="[padding:4px_8px_6px] [color:var(--text-4)] [font-size:10px] [font-family:Geist_Mono,_monospace] [font-weight:500] [letter-spacing:0.06em] [text-transform:uppercase]">
                {group.label}
              </div>
            )}
            {group.items.map(({ icon: Icon, label, to }) => (
              <Tooltip key={to} disableHoverableContent={!collapsed}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={to}
                    className="[display:block] [margin-bottom:1px]"
                  >
                    {({ isActive }) => (
                      <div
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            ;(e.currentTarget as HTMLDivElement).style.background =
                              "var(--bg-3)"
                            ;(e.currentTarget as HTMLDivElement).style.color =
                              "var(--text-1)"
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            ;(e.currentTarget as HTMLDivElement).style.background =
                              "transparent"
                            ;(e.currentTarget as HTMLDivElement).style.color =
                              "var(--text-3)"
                          }
                        }}
                        className={[
                          "[position:relative] [display:flex] [align-items:center] [gap:10px] [border-radius:6px] [cursor:pointer] [user-select:none] [transition:background_0.1s,_color_0.1s]",
                          collapsed ? "[padding:7px_0]" : "[padding:6px_8px]",
                          collapsed
                            ? "[justify-content:center]"
                            : "[justify-content:flex-start]",
                          isActive
                            ? "[background:var(--accent-bg)]"
                            : "[background:transparent]",
                          isActive
                            ? "[color:var(--accent)]"
                            : "[color:var(--text-3)]",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {isActive && (
                          <span className="[position:absolute] [left:0] [top:50%] [transform:translateY(-50%)] [width:2px] [height:14px] [background:var(--accent)] [border-radius:0_2px_2px_0]" />
                        )}
                        <Icon size={13} className="[flex-shrink:0]" />
                        <AnimatePresence>
                          {!collapsed && (
                            <motion.span
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className={[
                                "[font-size:13px] [letter-spacing:-0.004em] [white-space:nowrap] [overflow:hidden]",
                                isActive
                                  ? "[font-weight:500]"
                                  : "[font-weight:400]",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            >
                              {label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </NavLink>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">{label}</TooltipContent>
                )}
              </Tooltip>
            ))}
          </section>
        ))}
      </nav>

      {/* User */}
      <div className="[padding:8px]">
        <div
          role="button"
          tabIndex={0}
          aria-label="Account settings"
          onClick={() => navigate("/app/settings?tab=account")}
          onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); navigate("/app/settings?tab=account"); } }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLDivElement).style.background =
              "var(--bg-3)"
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLDivElement).style.background =
              "transparent"
          }}
          className={[
            "[display:flex] [align-items:center] [gap:8px] [border-radius:6px] [padding:8px] [cursor:pointer] [transition:background_0.1s]",
            collapsed
              ? "[justify-content:center]"
              : "[justify-content:flex-start]",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="[width:22px] [height:22px] [border-radius:50%] [flex-shrink:0] [display:flex] [align-items:center] [justify-content:center] [font-size:10px] [font-weight:600] [font-family:Geist_Mono,_monospace] [background:var(--bg-3)] [border:1px_solid_var(--border-2)] [color:var(--text-1)]">
            {user?.name.split(" ").filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() ?? "?"}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="[flex:1] [overflow:hidden]"
              >
                <p className="[font-size:12px] [font-weight:500] [letter-spacing:-0.004em] [color:var(--text-1)] [white-space:nowrap] [margin:0]">
                  {user?.name ?? "Account"}
                </p>
                <p className="[font-size:11px] [color:var(--text-3)] [white-space:nowrap] [margin:0]">
                  {user?.email ?? ""}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
/* ── Header ─────────────────────────────────────────────── */
function AppHeader({
  currentLabel,
  onMobileMenu,
  searchOpen,
  setSearchOpen,
}: {
  currentLabel: string
  onMobileMenu: () => void
  searchOpen: boolean
  setSearchOpen: (v: boolean) => void
}) {
  const { activeEnvironment, setActiveEnvironment } = useAppStore()
  return (
    <header className="[display:flex] [align-items:center] [gap:12px] [padding:0_16px] [flex-shrink:0] [border-bottom:1px_solid_var(--border)] [background:var(--bg)] [height:52px] [position:relative]">
      {/* Mobile menu */}
      <button
        onClick={onMobileMenu}
        className="lg:hidden [color:var(--text-3)] [background:none] [border:none] [cursor:pointer] [flex-shrink:0]"
      >
        <Menu size={16} />
      </button>

      {/* LEFT — project picker */}
      <div className="[flex-shrink:0]">
        <ProjectPicker />
      </div>

      {/* CENTER — breadcrumb, absolutely centred */}
      <div className="hidden sm:flex [position:absolute] [left:0] [right:0] [top:0] [bottom:0] [align-items:center] [justify-content:center] [pointer-events:none]">
        <div className="[pointer-events:auto]">
          <Breadcrumb>
            <BreadcrumbList className="[flex-wrap:nowrap]">
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/app/overview"
                  className="[font-size:13px] [font-family:Geist,_sans-serif] [letter-spacing:-0.004em] [color:var(--text-3)] [text-decoration:none] [transition:color_0.12s] [white-space:nowrap] hover:[color:var(--text-1)]"
                >
                  Sherlock
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="[color:var(--text-4)]" />
              <BreadcrumbItem>
                <BreadcrumbPage className="[font-size:13px] [font-family:Geist,_sans-serif] [font-weight:500] [letter-spacing:-0.004em] [color:var(--text-1)] [white-space:nowrap]">
                  {currentLabel}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* RIGHT — controls */}
      <div className="[display:flex] [align-items:center] [gap:8px] [margin-left:auto] [flex-shrink:0]">
        <div className="hidden md:block">
          <SherlockSelect
            value={activeEnvironment}
            onChange={(v) =>
              setActiveEnvironment(
                v as "development" | "staging" | "production",
              )
            }
            options={[
              { value: "development", label: "development" },
              { value: "staging", label: "staging" },
              { value: "production", label: "production" },
            ]}
            minWidth={120}
          />
        </div>

        <button
          onClick={() => setSearchOpen(true)}
          className="hidden sm:flex [align-items:center] [gap:8px] [border-radius:6px] [border:1px_solid_var(--border)] [background:var(--bg-2)] [color:var(--text-3)] [padding:5px_10px] [font-size:12px] [letter-spacing:-0.004em] [cursor:pointer] [transition:border-color_0.15s,_color_0.15s] hover:[border-color:var(--border-2)] hover:[color:var(--text-1)]"
        >
          <Search size={11} />
          <span>Search…</span>
          <span className="[font-size:10px] [padding:1px_5px] [background:var(--bg-3)] [border:1px_solid_var(--border-2)] [color:var(--text-4)] [border-radius:4px] [font-family:Geist_Mono,_monospace] [margin-left:4px]">
            ⌘K
          </span>
        </button>

        <Tooltip>
          <TooltipTrigger asChild>
            <button className="[position:relative] [color:var(--text-3)] [background:none] [border:none] [cursor:pointer] [transition:color_0.15s] hover:[color:var(--text-1)]">
              <Bell size={15} />
              <span className="[position:absolute] [top:-4px] [right:-4px] [width:14px] [height:14px] [display:flex] [align-items:center] [justify-content:center] [border-radius:50%] [font-size:8px] [font-weight:700] [font-family:Geist_Mono,_monospace] [background:var(--red)] [color:#fff]">
                3
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">3 unread alerts</TooltipContent>
        </Tooltip>

        <ThemeToggle />
      </div>
    </header>
  )
}
/* ── Shell ──────────────────────────────────────────────── */
export default function Shell() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 1024,
  )
  const sidebarPanelRef = usePanelRef()
  useTheme()
  const location = useLocation()
  const currentNav = NAV.find((n) => location.pathname.startsWith(n.to))
  const currentLabel = currentNav?.label ?? "Sherlock"
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [])
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])
  useEffect(() => {
    if (isMobile) setMobileOpen(false)
  }, [location.pathname, isMobile])
  /* Toggle: snap between expanded (220px) and collapsed (48px) */
  const handleToggle = useCallback(() => {
    const panel = sidebarPanelRef.current
    if (!panel) {
      setCollapsed((c) => !c)
      return
    }
    if (collapsed) {
      panel.resize(`${SIDEBAR_EXPANDED_PX}px`)
    } else {
      panel.resize(`${SIDEBAR_COLLAPSED_PX}px`)
    }
  }, [collapsed, sidebarPanelRef])
  /* Detect icon-only mode from live resize */
  const handleSidebarResize = useCallback((size: { inPixels: number }) => {
    setCollapsed(size.inPixels < COLLAPSE_THRESHOLD_PX)
  }, [])
  return (
    <div className="[display:flex] [height:100%] [background:var(--bg)] [color:var(--text-1)] [overflow:hidden]">
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="lg:hidden [position:fixed] [inset:0] [z-index:40] [background:rgba(0,0,0,0.6)]"
          />
        )}
      </AnimatePresence>

      {/* ─── Mobile sidebar (fixed overlay) ─────────────────── */}
      <AnimatePresence>
        {isMobile && mobileOpen && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: -SIDEBAR_EXPANDED_PX }}
            animate={{ x: 0 }}
            exit={{ x: -SIDEBAR_EXPANDED_PX }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            style={{
              width: SIDEBAR_EXPANDED_PX,
            }}
            className="[position:fixed] [left:0] [top:0] [bottom:0] [z-index:50] [border-right:1px_solid_var(--border)]"
          >
            <SidebarContent
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
              isMobile={true}
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ─── Desktop: resizable sidebar + main ──────────────── */}
      {isMobile ? (
        /* Mobile layout — full width main + overlay sidebar above */
        <div className="[display:flex] [flex-direction:column] [flex:1] [min-width:0] [height:100%]">
          <AppHeader
            currentLabel={currentLabel}
            onMobileMenu={() => setMobileOpen(true)}
            searchOpen={searchOpen}
            setSearchOpen={setSearchOpen}
          />
          <main className="[flex:1] [overflow:auto] [background:var(--bg)]">
            <WorkspaceConnection />
            <Outlet />
          </main>
        </div>
      ) : (
        /* Desktop layout — ResizablePanelGroup; wrapper gives it flex: 1 so it fills the shell */
        <div className="[flex:1] [height:100%] [overflow:hidden]">
          <ResizablePanelGroup orientation="horizontal">
            {/* Sidebar panel */}
            <ResizablePanel
              panelRef={sidebarPanelRef}
              id="shell-sidebar"
              defaultSize={`${SIDEBAR_EXPANDED_PX}px`}
              minSize={`${SIDEBAR_COLLAPSED_PX}px`}
              maxSize="320px"
              onResize={handleSidebarResize}
              className="[overflow:hidden] [border-right:1px_solid_var(--border)]"
            >
              <SidebarContent collapsed={collapsed} onToggle={handleToggle} />
            </ResizablePanel>

            {/* Drag handle */}
            <ResizableHandle
              orientation="horizontal"
              aria-label="Drag to resize sidebar"
            />

            {/* Main panel */}
            <ResizablePanel
              id="shell-main"
              className="[overflow:hidden]"
            >
              <div className="[display:flex] [flex-direction:column] [height:100%]">
                <AppHeader
                  currentLabel={currentLabel}
                  onMobileMenu={() => setMobileOpen(true)}
                  searchOpen={searchOpen}
                  setSearchOpen={setSearchOpen}
                />
                <main className="[flex:1] [overflow:auto] [background:var(--bg)]">
                  <WorkspaceConnection />
                  <Outlet />
                </main>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
