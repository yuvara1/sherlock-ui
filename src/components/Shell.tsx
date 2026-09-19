import { useState, useEffect, useRef, useCallback } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, AlertTriangle, Terminal, GitBranch, ScrollText,
  BarChart3, Server, Brain, Settings, Network, Layers,
  Bell, Search, ChevronDown, ChevronRight, Menu, XCircle, Rocket, Plus,
  ChevronsUpDown, Plug, BellRing,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTheme } from "@/lib/theme";
import { useAppStore, useActiveProject } from "@/stores/appStore";
import { SherlockSelect } from "@/components/ui/SherlockSelect";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { CommandPalette } from "@/components/ui/CommandPalette";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  usePanelRef,
} from "@/components/ui/resizable";

const NAV = [
  { icon: LayoutDashboard, label: "Overview",       to: "/app/overview"     },
  { icon: Layers,          label: "Projects",       to: "/app/projects"     },
  { icon: AlertTriangle,   label: "Incidents",      to: "/app/incidents"    },
  { icon: XCircle,         label: "Errors",         to: "/app/errors"       },
  { icon: GitBranch,       label: "Traces",         to: "/app/traces"       },
  { icon: ScrollText,      label: "Logs",           to: "/app/logs"         },
  { icon: BarChart3,       label: "Metrics",        to: "/app/metrics"      },
  { icon: Server,          label: "Services",       to: "/app/services"     },
  { icon: Network,         label: "Dependencies",   to: "/app/dependencies" },
  { icon: Rocket,          label: "Deployments",    to: "/app/deployments"  },
  { icon: Plug,            label: "Integrations",   to: "/app/integrations" },
  { icon: BellRing,        label: "Alerts",         to: "/app/alerts"       },
  { icon: Terminal,        label: "APIs",           to: "/app/apis"         },
  { icon: Brain,           label: "AI Debugger",    to: "/app/ai"           },
  { icon: Settings,        label: "Settings",       to: "/app/settings"     },
];

const SIDEBAR_EXPANDED_PX = 220;
const SIDEBAR_COLLAPSED_PX = 48;
const COLLAPSE_THRESHOLD_PX = 100; // below this → icon-only mode

/* ── Helpers ────────────────────────────────────────────── */
function StatusDot({ status }: { status: string }) {
  const color = status === "CRITICAL" ? "var(--red)" : status === "DEGRADED" ? "var(--yellow)" : "var(--green)";
  return <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />;
}

function ProjectIcon({ name, size = 24 }: { name: string; size?: number }) {
  const hue = (name.charCodeAt(0) * 37 + name.charCodeAt(1) * 13) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: 6, flexShrink: 0,
      background: `hsl(${hue},60%,18%)`,
      border: `1px solid hsl(${hue},40%,28%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 16 14" fill="none">
        <path d="M8 1L15 13H1L8 1Z" fill={`hsl(${hue},80%,65%)`} />
      </svg>
    </div>
  );
}

/* ── Project Picker ─────────────────────────────────────── */
function ProjectPicker() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { projects, activeProjectId, setActiveProject } = useAppStore();
  const activeProject = useActiveProject();
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const filtered = projects.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (open) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", handler); document.removeEventListener("keydown", esc); };
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", gap: 7, padding: "5px 8px", borderRadius: 7,
        border: "1px solid transparent", background: open ? "var(--bg-3)" : "transparent",
        cursor: "pointer", transition: "background 0.12s, border-color 0.12s",
      }}
        onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-3)"; e.currentTarget.style.borderColor = "var(--border)"; }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; } }}
      >
        <ProjectIcon name={activeProject?.name ?? "A"} size={20} />
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", letterSpacing: "-0.008em", whiteSpace: "nowrap", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis" }}>
          {activeProject?.name ?? "Select project"}
        </span>
        <ChevronsUpDown size={11} style={{ color: "var(--text-4)", flexShrink: 0 }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }} transition={{ duration: 0.12, ease: "easeOut" }}
            style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0, width: 248,
              background: "var(--bg-2)", border: "1px solid var(--border)", borderRadius: 10,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.12)", zIndex: 999, overflow: "hidden",
            }}
          >
            <div style={{ padding: "8px 8px 4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 7, background: "var(--bg-3)", border: "1px solid var(--border)" }}>
                <Search size={11} style={{ color: "var(--text-4)", flexShrink: 0 }} />
                <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Find Project..."
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 12, fontFamily: "Geist, sans-serif", color: "var(--text-2)", letterSpacing: "-0.004em" }} />
                <kbd style={{ fontSize: 10, fontFamily: "Geist Mono, monospace", padding: "1px 5px", borderRadius: 4, border: "1px solid var(--border-2)", color: "var(--text-4)", background: "var(--bg)" }}>Esc</kbd>
              </div>
            </div>
            <div style={{ padding: "4px 8px" }}>
              {filtered.length === 0
                ? <p style={{ fontSize: 12, color: "var(--text-4)", padding: "10px 8px", textAlign: "center" }}>No projects found</p>
                : filtered.map(project => (
                  <button key={project.id}
                    onClick={() => { setActiveProject(project.id); setOpen(false); navigate("/app/overview"); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "7px 8px", borderRadius: 7,
                      background: project.id === activeProjectId ? "var(--bg-3)" : "transparent",
                      border: "none", cursor: "pointer", transition: "background 0.1s", textAlign: "left",
                    }}
                    onMouseEnter={e => { if (project.id !== activeProjectId) e.currentTarget.style.background = "var(--bg-3)"; }}
                    onMouseLeave={e => { if (project.id !== activeProjectId) e.currentTarget.style.background = "transparent"; }}
                  >
                    <ProjectIcon name={project.name} size={24} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", letterSpacing: "-0.008em", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{project.name}</p>
                      <p style={{ fontSize: 11, color: "var(--text-4)", margin: 0, fontFamily: "Geist Mono, monospace" }}>{project.serviceCount} services</p>
                    </div>
                    <StatusDot status={project.status} />
                  </button>
                ))
              }
            </div>
            <div style={{ borderTop: "1px solid var(--border)", padding: "4px 8px 8px" }}>
              <button onClick={() => { setOpen(false); navigate("/app/projects"); }}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "8px 8px", borderRadius: 7, background: "transparent", border: "none", cursor: "pointer", transition: "background 0.1s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-3)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, border: "1px dashed var(--border-2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Plus size={11} style={{ color: "var(--text-3)" }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-2)", letterSpacing: "-0.008em" }}>Create Project</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Sidebar content ─────────────────────────────────────── */
function SidebarContent({
  collapsed,
  onToggle,
  isMobile = false,
}: {
  collapsed: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}) {
  const location = useLocation();

  return (
    <div style={{
      display: "flex", flexDirection: "column", height: "100%", overflow: "hidden",
      background: "var(--bg)", borderRight: isMobile ? "none" : "none",
    }}>
      {/* Logo / brand bar */}
      <div style={{
        display: "flex", alignItems: "center", flexShrink: 0, height: 52, padding: "0 12px",
        borderBottom: "1px solid var(--border)",
        justifyContent: collapsed ? "center" : "space-between",
      }}>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width={12} height={11} viewBox="0 0 16 14" fill="none">
                  <path d="M8 1L15 13H1L8 1Z" fill="#fff" />
                </svg>
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-1)", whiteSpace: "nowrap" }}>
                Sherlock
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {!isMobile && (
          <button onClick={onToggle}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 20, height: 20, color: "var(--text-4)", background: "none",
              border: "none", cursor: "pointer", flexShrink: 0, borderRadius: 4,
              transition: "color 0.1s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-2)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-4)")}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed
              ? <ChevronRight size={12} />
              : <ChevronDown size={12} style={{ transform: "rotate(90deg)" }} />
            }
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "8px", overflowY: "auto", overflowX: "hidden" }}>
        {NAV.map(({ icon: Icon, label, to }) => (
          <NavLink key={to} to={to} title={collapsed ? label : undefined} style={{ display: "block", marginBottom: 1 }}>
            {({ isActive }) => (
              <div style={{
                position: "relative", display: "flex", alignItems: "center", gap: 10,
                borderRadius: 6, cursor: "pointer", userSelect: "none",
                padding: collapsed ? "7px 0" : "6px 8px",
                justifyContent: collapsed ? "center" : "flex-start",
                background: isActive ? "var(--accent-bg)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--text-3)",
                transition: "background 0.1s, color 0.1s",
              }}
                onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLDivElement).style.background = "var(--bg-3)"; (e.currentTarget as HTMLDivElement).style.color = "var(--text-1)"; } }}
                onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLDivElement).style.background = "transparent"; (e.currentTarget as HTMLDivElement).style.color = "var(--text-3)"; } }}
              >
                {isActive && (
                  <span style={{
                    position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)",
                    width: 2, height: 14, background: "var(--accent)", borderRadius: "0 2px 2px 0",
                  }} />
                )}
                <Icon size={13} style={{ flexShrink: 0 }} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      style={{ fontSize: 13, fontWeight: isActive ? 500 : 400, letterSpacing: "-0.004em", whiteSpace: "nowrap", overflow: "hidden" }}>
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ padding: 8 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, borderRadius: 6, padding: 8, cursor: "pointer",
          justifyContent: collapsed ? "center" : "flex-start", transition: "background 0.1s",
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "var(--bg-3)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
        >
          <div style={{
            width: 22, height: 22, borderRadius: "50%", flexShrink: 0, display: "flex",
            alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 600, fontFamily: "Geist Mono, monospace",
            background: "var(--bg-3)", border: "1px solid var(--border-2)", color: "var(--text-1)",
          }}>
            JD
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, overflow: "hidden" }}>
                <p style={{ fontSize: 12, fontWeight: 500, letterSpacing: "-0.004em", color: "var(--text-1)", whiteSpace: "nowrap", margin: 0 }}>Jane Doe</p>
                <p style={{ fontSize: 11, color: "var(--text-3)", whiteSpace: "nowrap", margin: 0 }}>jane@acme.com</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/* ── Header ─────────────────────────────────────────────── */
function AppHeader({
  currentLabel,
  onMobileMenu,
  searchOpen,
  setSearchOpen,
}: {
  currentLabel: string;
  onMobileMenu: () => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
}) {
  const { activeEnvironment, setActiveEnvironment } = useAppStore();

  return (
    <header style={{
      display: "flex", alignItems: "center", gap: 12, padding: "0 16px", flexShrink: 0,
      borderBottom: "1px solid var(--border)", background: "var(--bg)", height: 52, position: "relative",
    }}>
      {/* Mobile menu */}
      <button className="lg:hidden" style={{ color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", flexShrink: 0 }} onClick={onMobileMenu}>
        <Menu size={16} />
      </button>

      {/* LEFT — project picker */}
      <div style={{ flexShrink: 0 }}>
        <ProjectPicker />
      </div>

      {/* CENTER — breadcrumb, absolutely centred */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, alignItems: "center", justifyContent: "center", pointerEvents: "none" }}
        className="hidden sm:flex">
        <div style={{ pointerEvents: "auto" }}>
          <Breadcrumb>
            <BreadcrumbList style={{ flexWrap: "nowrap" }}>
              <BreadcrumbItem>
                <BreadcrumbLink href="/app/overview"
                  style={{ fontSize: 13, fontFamily: "Geist, sans-serif", letterSpacing: "-0.004em", color: "var(--text-3)", textDecoration: "none", transition: "color 0.12s", whiteSpace: "nowrap" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
                >
                  Sherlock
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator style={{ color: "var(--text-4)" }} />
              <BreadcrumbItem>
                <BreadcrumbPage style={{ fontSize: 13, fontFamily: "Geist, sans-serif", fontWeight: 500, letterSpacing: "-0.004em", color: "var(--text-1)", whiteSpace: "nowrap" }}>
                  {currentLabel}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* RIGHT — controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", flexShrink: 0 }}>
        <div className="hidden md:block">
          <SherlockSelect
            value={activeEnvironment}
            onChange={v => setActiveEnvironment(v as "development" | "staging" | "production")}
            options={[
              { value: "development", label: "development" },
              { value: "staging",     label: "staging"     },
              { value: "production",  label: "production"  },
            ]}
            minWidth={120}
          />
        </div>

        <button onClick={() => setSearchOpen(true)} className="hidden sm:flex"
          style={{
            alignItems: "center", gap: 8, borderRadius: 6,
            border: "1px solid var(--border)", background: "var(--bg-2)",
            color: "var(--text-3)", padding: "5px 10px",
            fontSize: 12, letterSpacing: "-0.004em", cursor: "pointer",
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--border-2)"; e.currentTarget.style.color = "var(--text-1)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-3)"; }}
        >
          <Search size={11} />
          <span>Search…</span>
          <span style={{ fontSize: 10, padding: "1px 5px", background: "var(--bg-3)", border: "1px solid var(--border-2)", color: "var(--text-4)", borderRadius: 4, fontFamily: "Geist Mono, monospace", marginLeft: 4 }}>
            ⌘K
          </span>
        </button>

        <button style={{ position: "relative", color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", transition: "color 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
        >
          <Bell size={15} />
          <span style={{
            position: "absolute", top: -4, right: -4, width: 14, height: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "50%", fontSize: 8, fontWeight: 700, fontFamily: "Geist Mono, monospace",
            background: "var(--red)", color: "#fff",
          }}>3</span>
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
}

/* ── Shell ──────────────────────────────────────────────── */
export default function Shell() {
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMobile,   setIsMobile]   = useState(() => typeof window !== "undefined" && window.innerWidth < 1024);
  const sidebarPanelRef = usePanelRef();
  useTheme();

  const location     = useLocation();
  const currentNav   = NAV.find(n => location.pathname.startsWith(n.to));
  const currentLabel = currentNav?.label ?? "Sherlock";

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(o => !o); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => { if (isMobile) setMobileOpen(false); }, [location.pathname, isMobile]);

  /* Toggle: snap between expanded (220px) and collapsed (48px) */
  const handleToggle = useCallback(() => {
    const panel = sidebarPanelRef.current;
    if (!panel) { setCollapsed(c => !c); return; }
    if (collapsed) {
      panel.resize(`${SIDEBAR_EXPANDED_PX}px`);
    } else {
      panel.resize(`${SIDEBAR_COLLAPSED_PX}px`);
    }
  }, [collapsed, sidebarPanelRef]);

  /* Detect icon-only mode from live resize */
  const handleSidebarResize = useCallback((size: { inPixels: number }) => {
    setCollapsed(size.inPixels < COLLAPSE_THRESHOLD_PX);
  }, []);

  return (
    <div style={{ display: "flex", height: "100%", background: "var(--bg)", color: "var(--text-1)", overflow: "hidden" }}>

      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(0,0,0,0.6)" }}
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
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
              position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 50,
              width: SIDEBAR_EXPANDED_PX,
              borderRight: "1px solid var(--border)",
            }}
          >
            <SidebarContent collapsed={false} onToggle={() => setMobileOpen(false)} isMobile={true} />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ─── Desktop: resizable sidebar + main ──────────────── */}
      {isMobile ? (
        /* Mobile layout — full width main + overlay sidebar above */
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, height: "100%" }}>
          <AppHeader
            currentLabel={currentLabel}
            onMobileMenu={() => setMobileOpen(true)}
            searchOpen={searchOpen}
            setSearchOpen={setSearchOpen}
          />
          <main style={{ flex: 1, overflow: "auto", background: "var(--bg)" }}>
            <Outlet />
          </main>
        </div>
      ) : (
        /* Desktop layout — ResizablePanelGroup; wrapper gives it flex: 1 so it fills the shell */
        <div style={{ flex: 1, height: "100%", overflow: "hidden" }}>
        <ResizablePanelGroup orientation="horizontal">

          {/* Sidebar panel */}
          <ResizablePanel
            panelRef={sidebarPanelRef}
            id="shell-sidebar"
            order={1}
            defaultSize={`${SIDEBAR_EXPANDED_PX}px`}
            minSize={`${SIDEBAR_COLLAPSED_PX}px`}
            maxSize="320px"
            onResize={handleSidebarResize}
            style={{ overflow: "hidden", borderRight: "1px solid var(--border)" }}
          >
            <SidebarContent
              collapsed={collapsed}
              onToggle={handleToggle}
            />
          </ResizablePanel>

          {/* Drag handle */}
          <ResizableHandle
            orientation="horizontal"
            aria-label="Drag to resize sidebar"
          />

          {/* Main panel */}
          <ResizablePanel id="shell-main" order={2} style={{ overflow: "hidden" }}>
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <AppHeader
                currentLabel={currentLabel}
                onMobileMenu={() => setMobileOpen(true)}
                searchOpen={searchOpen}
                setSearchOpen={setSearchOpen}
              />
              <main style={{ flex: 1, overflow: "auto", background: "var(--bg)" }}>
                <Outlet />
              </main>
            </div>
          </ResizablePanel>

        </ResizablePanelGroup>
        </div>
      )}

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
