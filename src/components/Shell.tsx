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
  Menu,
  XCircle,
  Rocket,
  Plus,
  ChevronsUpDown,
  Plug,
  BellRing,
  Building2,
  Package,
} from "lucide-react"
import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { UI_PREVIEW_ACCESS_TOKEN } from "@/api/client"
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
import { StickyBanner } from "@/components/ui/sticky-banner"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
const NAV_GROUPS = [
  {
    label: "Workspace",
    items: [
      { icon: LayoutDashboard, label: "Overview", to: "/app/overview" },
      { icon: Layers, label: "Projects", to: "/app/projects" },
    ],
  },
  {
    label: "Build",
    items: [{ icon: Terminal, label: "API Explorer", to: "/app/apis" }],
  },
  {
    label: "Observe",
    items: [
      { icon: AlertTriangle, label: "Incidents", to: "/app/incidents" },
      { icon: ScrollText, label: "Logs", to: "/app/logs" },
      { icon: XCircle, label: "Errors", to: "/app/errors" },
      { icon: GitBranch, label: "Traces", to: "/app/traces" },
      { icon: Server, label: "Services", to: "/app/services" },
      { icon: BarChart3, label: "Metrics", to: "/app/metrics" },
      { icon: Network, label: "Dependencies", to: "/app/dependencies" },
      {
        icon: Package,
        label: "Packages",
        to: "/app/dependencies/packages",
      },
      { icon: Rocket, label: "Deployments", to: "/app/deployments" },
    ],
  },
  {
    label: "Investigate",
    items: [{ icon: Brain, label: "Investigation", to: "/app/ai" }],
  },
  {
    label: "Manage",
    items: [
      { icon: Plug, label: "Integrations", to: "/app/integrations" },
      {
        icon: BellRing,
        label: "Alerts",
        to: "/app/alerts",
      },
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
interface ProjectIconProps {
  name: string
  size?: number
}
function ProjectIcon({ name, size = 24 }: ProjectIconProps) {
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
    <div ref={ref} className="relative min-w-0">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label="Select project"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={[
          "h-9 w-52 max-w-full justify-start gap-2 border border-transparent px-2",
          open
            ? "border-border bg-muted text-foreground"
            : "bg-transparent hover:border-border hover:bg-muted",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <ProjectIcon name={activeProject?.name ?? "A"} size={20} />
        <span className="min-w-0 flex-1 truncate text-left text-[13px] font-medium tracking-[-0.008em] text-foreground">
          {activeProject?.name ?? "Select project"}
        </span>
        <ChevronsUpDown
          size={11}
          aria-hidden="true"
          className="shrink-0 text-muted-foreground"
        />
      </Button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute left-0 top-[calc(100%+0.375rem)] z-[999] w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-lg"
          >
            <div className="px-2 pb-1 pt-2">
              <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-background px-2.5">
                <Search
                  size={13}
                  aria-hidden="true"
                  className="shrink-0 text-muted-foreground"
                />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Find project…"
                  aria-label="Find project"
                  className="min-w-0 flex-1 border-none bg-transparent text-xs text-foreground outline-none"
                />
                <kbd className="shrink-0 rounded border border-input bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  Esc
                </kbd>
              </div>
            </div>
            <div className="px-2 py-1">
              {filtered.length === 0 ? (
                <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                  No projects found
                </p>
              ) : (
                filtered.map((project) => (
                  <Button
                    type="button"
                    variant="ghost"
                    key={project.id}
                    onClick={() => {
                      setActiveProject(project.id)
                      setOpen(false)
                      navigate("/app/overview")
                    }}
                    className={[
                      "grid h-auto w-full grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2.5 rounded-md px-2 py-2 text-left",
                      project.id === activeProjectId
                        ? "bg-muted text-foreground"
                        : "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <ProjectIcon name={project.name} size={24} />
                    <div className="min-w-0">
                      <p className="m-0 truncate text-[13px] font-medium tracking-[-0.008em] text-foreground">
                        {project.name}
                      </p>
                      <p className="m-0 font-mono text-[11px] text-muted-foreground">
                        {project.serviceCount} services
                      </p>
                    </div>
                    <StatusDot status={project.status} />
                  </Button>
                ))
              )}
            </div>
            <div className="border-t border-border px-2 pb-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setOpen(false)
                  navigate("/app/projects")
                }}
                className="h-10 w-full justify-start gap-2.5 px-2 text-[13px] text-muted-foreground"
              >
                <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-dashed border-input">
                  <Plus size={12} aria-hidden="true" />
                </div>
                <span className="font-medium">Manage projects</span>
              </Button>
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
  const user = useAuthStore((state) => state.user)
  const [openGroups, setOpenGroups] = useState(() =>
    NAV_GROUPS.map((group) => group.label),
  )
  const toggleGroup = (label: string) => {
    setOpenGroups((current) =>
      current.includes(label)
        ? current.filter((item) => item !== label)
        : [...current, label],
    )
  }
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
          "[display:flex] [align-items:center] [flex-shrink:0] [height:46px] [padding:0_12px] [border-bottom:1px_solid_var(--border)]",
          collapsed
            ? "[justify-content:center]"
            : "[justify-content:space-between]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <AnimatePresence mode="wait">
          {collapsed && !isMobile ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  key="collapsed-brand"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onToggle}
                    aria-label="Expand sidebar"
                    className="size-8"
                  >
                    <span className="flex size-[22px] items-center justify-center rounded-md bg-[var(--accent)]">
                      <svg
                        width={12}
                        height={11}
                        viewBox="0 0 16 14"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path d="M8 1L15 13H1L8 1Z" fill="#fff" />
                      </svg>
                    </span>
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            </Tooltip>
          ) : (
            <motion.div
              key="expanded-brand"
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

        {!isMobile && !collapsed && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className="size-7 shrink-0 text-muted-foreground"
          >
            <ChevronDown size={12} aria-hidden="true" className="rotate-90" />
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav
        aria-label="Workspace navigation"
        className="[flex:1] [padding:8px] [overflow-y:auto] [overflow-x:hidden]"
      >
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
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-expanded={openGroups.includes(group.label)}
                onClick={() => toggleGroup(group.label)}
                className="sidebar-group-label h-7 w-full justify-between rounded-md"
              >
                <span>{group.label}</span>
                <ChevronDown
                  size={12}
                  aria-hidden="true"
                  className={
                    openGroups.includes(group.label)
                      ? "rotate-0 transition-transform"
                      : "-rotate-90 transition-transform"
                  }
                />
              </Button>
            )}
            {(collapsed || openGroups.includes(group.label)) &&
              group.items.map(({ icon: Icon, label, to }) => (
                <Tooltip key={to} disableHoverableContent={!collapsed}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={to}
                      end={to === "/app/dependencies"}
                      className="[display:block] [margin-bottom:1px]"
                    >
                      {({ isActive }) => (
                        <div
                          className={[
                            "[position:relative] [display:flex] [align-items:center] [gap:10px] [border-radius:6px] [cursor:pointer] [user-select:none] [transition:background_0.1s,_color_0.1s]",
                            collapsed
                              ? "[padding:7px_0]"
                              : to === "/app/dependencies/packages"
                                ? "[padding:6px_8px_6px_28px]"
                                : "[padding:6px_8px]",
                            collapsed
                              ? "[justify-content:center]"
                              : "[justify-content:flex-start]",
                            isActive
                              ? "[background:var(--accent-bg)]"
                              : "[background:transparent]",
                            isActive
                              ? "[color:var(--accent)]"
                              : "[color:var(--text-3)] hover:[background:var(--bg-3)] hover:[color:var(--text-1)]",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        >
                          {isActive && (
                            <span className="[position:absolute] [left:0] [top:50%] [transform:translateY(-50%)] [width:2px] [height:14px] [background:var(--accent)] [border-radius:0_2px_2px_0]" />
                          )}
                          <Icon
                            size={
                              to === "/app/dependencies/packages" ? 12 : 13
                            }
                            className="[flex-shrink:0]"
                          />
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
        <Button
          type="button"
          variant="ghost"
          aria-label="Account settings"
          onClick={() => navigate("/app/settings?tab=account")}
          className={[
            "h-auto w-full gap-2 rounded-md p-2",
            collapsed ? "justify-center" : "justify-start text-left",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="[width:22px] [height:22px] [border-radius:50%] [flex-shrink:0] [display:flex] [align-items:center] [justify-content:center] [font-size:10px] [font-weight:600] [font-family:Geist_Mono,_monospace] [background:var(--bg-3)] [border:1px_solid_var(--border-2)] [color:var(--text-1)]">
            {user?.name
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((part) => part[0])
              .join("")
              .toUpperCase() ?? "?"}
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
        </Button>
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
  menuExpanded = false,
}: {
  currentLabel: string
  onMobileMenu: () => void
  searchOpen: boolean
  setSearchOpen: (v: boolean) => void
  menuExpanded?: boolean
}) {
  const { activeEnvironment, setActiveEnvironment } = useAppStore()
  const navigate = useNavigate()
  return (
    <header className="[display:flex] [align-items:center] [gap:10px] [padding:0_12px] [flex-shrink:0] [border-bottom:1px_solid_var(--border)] [background:var(--bg)] [height:46px] [position:relative]">
      {/* Mobile menu */}
      <Button
        variant="ghost"
        size="icon"
        aria-label="Open navigation"
        aria-expanded={menuExpanded}
        aria-controls="mobile-navigation"
        onClick={onMobileMenu}
        className="lg:hidden shrink-0 text-muted-foreground"
      >
        <Menu size={16} aria-hidden="true" />
      </Button>

      {/* LEFT — project picker */}
      <div className="min-w-0 flex-1 lg:flex-none">
        <ProjectPicker />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label="Select workspace"
            className="hidden max-w-48 gap-2 text-muted-foreground md:inline-flex"
          >
            <Building2 size={14} aria-hidden="true" />
            <span className="truncate">Sherlock workspace</span>
            <ChevronsUpDown size={12} aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-60">
          <DropdownMenuLabel>Current workspace</DropdownMenuLabel>
          <DropdownMenuItem className="justify-between">
            <span>Sherlock workspace</span>
            <span className="font-mono text-xs text-muted-foreground">
              Free
            </span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => navigate("/app/settings")}>
            <Settings size={14} aria-hidden="true" />
            Workspace settings
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Breadcrumb participates in layout so utility controls cannot overlap it. */}
      <div className="hidden min-w-0 flex-1 items-center justify-center xl:flex">
        <div className="min-w-0">
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
              { value: "development", label: "Development" },
              { value: "staging", label: "Staging" },
              { value: "production", label: "Production" },
            ]}
            minWidth={120}
          />
        </div>

        <Button
          variant="ghost"
          aria-label="Search pages and services"
          aria-haspopup="dialog"
          aria-expanded={searchOpen}
          onClick={() => setSearchOpen(true)}
          className="gap-2 text-muted-foreground"
        >
          <Search size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Search…</span>
          <span
            aria-hidden="true"
            className="hidden lg:inline font-mono text-xs"
          >
            Ctrl / ⌘ K
          </span>
        </Button>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="View alerts, 3 unread"
              onClick={() => navigate("/app/alerts")}
              className="relative shrink-0 text-muted-foreground"
            >
              <Bell size={15} aria-hidden="true" />
              <span className="[position:absolute] [top:-4px] [right:-4px] [width:14px] [height:14px] [display:flex] [align-items:center] [justify-content:center] [border-radius:50%] [font-size:8px] [font-weight:700] [font-family:Geist_Mono,_monospace] [background:var(--red)] [color:#fff]">
                3
              </span>
            </Button>
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
  const isPreview = useAuthStore(
    (state) => state.accessToken === UI_PREVIEW_ACCESS_TOKEN,
  )
  useTheme()
  const location = useLocation()
  const currentNav = [...NAV]
    .sort((a, b) => b.to.length - a.to.length)
    .find(
      (item) =>
        location.pathname === item.to ||
        location.pathname.startsWith(`${item.to}/`),
    )
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
      <BreadcrumbLink
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:p-3 focus:text-foreground"
      >
        Skip to main content
      </BreadcrumbLink>
      <Dialog open={isMobile && mobileOpen} onOpenChange={setMobileOpen}>
        <DialogContent
          id="mobile-navigation"
          aria-describedby={undefined}
          className="left-0 top-0 h-dvh max-h-dvh w-64 max-w-full translate-x-0 translate-y-0 rounded-none bg-background"
        >
          <DialogTitle className="sr-only">Workspace navigation</DialogTitle>
          <SidebarContent
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
            isMobile={true}
          />
        </DialogContent>
      </Dialog>

      {/* ─── Desktop: resizable sidebar + main ──────────────── */}
      {isMobile ? (
        /* Mobile layout — full width main + overlay sidebar above */
        <div className="[display:flex] [flex-direction:column] [flex:1] [min-width:0] [height:100%]">
          <AppHeader
            currentLabel={currentLabel}
            onMobileMenu={() => setMobileOpen(true)}
            searchOpen={searchOpen}
            setSearchOpen={setSearchOpen}
            menuExpanded={mobileOpen}
          />
          <main
            id="main-content"
            tabIndex={-1}
            className="[flex:1] [overflow:auto] [background:var(--bg)]"
          >
            {isPreview ? <PreviewNotice /> : <WorkspaceConnection />}
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
            <ResizablePanel id="shell-main" className="[overflow:hidden]">
              <div className="[display:flex] [flex-direction:column] [height:100%]">
                <AppHeader
                  currentLabel={currentLabel}
                  onMobileMenu={() => setMobileOpen(true)}
                  searchOpen={searchOpen}
                  setSearchOpen={setSearchOpen}
                />
                <main
                  id="main-content"
                  tabIndex={-1}
                  className="[flex:1] [overflow:auto] [background:var(--bg)]"
                >
                  {isPreview ? (
                    <StickyPreviewNotice />
                  ) : (
                    <WorkspaceConnection />
                  )}
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

function PreviewNotice() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-primary/20 bg-primary/5 px-4 py-2 text-xs">
      <span className="font-medium text-primary">UI preview</span>
      <span className="text-muted-foreground">
        Local session · Telemetry uses demo data. No live monitoring is
        connected.
      </span>
    </div>
  )
}

function StickyPreviewNotice() {
  return (
    <StickyBanner
      removeOnClose
      sticky={false}
      className="border-b border-primary/30 bg-gradient-to-b from-blue-500 to-blue-600"
    >
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 pr-8 text-xs text-white">
        <span className="font-semibold">UI preview</span>
        <span className="text-white/90">
          Local session · Telemetry uses demo data. No live monitoring is
          connected.
        </span>
      </div>
    </StickyBanner>
  )
}
