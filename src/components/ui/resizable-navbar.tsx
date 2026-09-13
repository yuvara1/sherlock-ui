/**
 * Aceternity UI — Resizable Navbar
 * Full-width at top → compact floating pill on scroll.
 * API-compatible with @aceternity/resizable-navbar.
 */
"use client";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "motion/react";
import React, { createContext, useContext, useRef, useState } from "react";

/* ── Internal scroll context ── */
interface NavCtx {
  visible: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
}
const NavContext = createContext<NavCtx>({ visible: false, open: false, setOpen: () => {} });

/* ──────────────────────────────────────────
   Navbar — root wrapper, owns scroll state
─────────────────────────────────────────── */
export function Navbar({ children, className }: { children: React.ReactNode; className?: string }) {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const prev = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const dir = latest < prev.current ? "up" : "down";
    if (latest < 80) {
      setVisible(false);
    } else if (dir === "down" || latest > 100) {
      setVisible(true);
    }
    prev.current = latest;
  });

  return (
    <NavContext.Provider value={{ visible, open, setOpen }}>
      <div className={cn("fixed inset-x-0 top-0 z-[100] w-full", className)}>
        {children}
      </div>
    </NavContext.Provider>
  );
}

/* ──────────────────────────────────────────
   NavBody — morphs full-width ↔ pill
─────────────────────────────────────────── */
export function NavBody({ children, className, style: styleProp, visible: visibleProp }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; visible?: boolean }) {
  const ctx = useContext(NavContext);
  const visible = visibleProp !== undefined ? visibleProp : ctx.visible;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={visible ? "pill" : "full"}
        initial={false}
        animate={
          visible
            ? {
                maxWidth: 760,
                margin: "12px auto 0",
                borderRadius: 9999,
                background: "rgba(4,4,8,0.85)",
                boxShadow: "0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.5)",
                backdropFilter: "blur(20px)",
                paddingLeft: 20,
                paddingRight: 20,
              }
            : {
                maxWidth: "100%",
                margin: "0 auto",
                borderRadius: 0,
                background: "transparent",
                boxShadow: "none",
                backdropFilter: "none",
                paddingLeft: 24,
                paddingRight: 24,
              }
        }
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{ height: visible ? 52 : 64, ...styleProp }}
        className={cn(
          "relative flex w-full items-center justify-between",
          className,
        )}
      >
        {/* Top border highlight when pill */}
        <AnimatePresence>
          {visible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-x-0 top-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)" }}
            />
          )}
        </AnimatePresence>
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ──────────────────────────────────────────
   NavItems — desktop link list with hover underline
─────────────────────────────────────────── */
interface NavItem { name: string; link: string }

export function NavItems({
  items,
  className,
  onItemClick,
}: {
  items: NavItem[];
  className?: string;
  onItemClick?: () => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <nav className={cn("hidden md:flex items-center gap-1", className)}>
      {items.map((item) => (
        <a
          key={item.name}
          href={item.link}
          onClick={onItemClick}
          onMouseEnter={() => setHovered(item.name)}
          onMouseLeave={() => setHovered(null)}
          className="relative px-3 py-1.5 text-sm transition-colors duration-150 select-none"
          style={{
            color: hovered === item.name ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)",
            letterSpacing: "-0.004em",
            textDecoration: "none",
          }}
        >
          {hovered === item.name && (
            <motion.span
              layoutId="nav-hover-bg"
              className="absolute inset-0 rounded-lg"
              style={{ background: "rgba(255,255,255,0.06)" }}
              transition={{ type: "spring", duration: 0.2 }}
            />
          )}
          <span className="relative z-10">{item.name}</span>
        </a>
      ))}
    </nav>
  );
}

/* ──────────────────────────────────────────
   NavbarButton — CTA button variants
─────────────────────────────────────────── */
type BtnVariant = "primary" | "secondary" | "dark" | "gradient";

const BTN_STYLES: Record<BtnVariant, React.CSSProperties> = {
  primary: {
    background: "#fff", color: "#000", border: "none",
  },
  secondary: {
    background: "transparent", color: "rgba(255,255,255,0.65)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  dark: {
    background: "rgba(255,255,255,0.06)", color: "#fff",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  gradient: {
    background: "linear-gradient(135deg, #0070f3 0%, #7c3aed 100%)",
    color: "#fff", border: "none",
  },
};

export function NavbarLogo() {
  return (
    <a href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", flexShrink: 0 }}>
      <div style={{ width: 26, height: 26, borderRadius: 7, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      </div>
      <span style={{ fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: "-0.008em" }}>Sherlock</span>
    </a>
  );
}

export function NavbarButton({
  href,
  as: Tag = "button",
  children,
  className,
  variant = "secondary",
  onClick,
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: BtnVariant;
  onClick?: () => void;
}) {
  const style: React.CSSProperties = {
    ...BTN_STYLES[variant],
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    letterSpacing: "-0.004em",
    padding: "7px 16px",
    borderRadius: 9999,
    cursor: "pointer",
    transition: "opacity 0.15s, transform 0.15s",
    textDecoration: "none",
    fontFamily: "Geist, sans-serif",
  };
  const El = href ? "a" : Tag;
  return (
    <El
      href={href}
      onClick={onClick}
      className={cn("flex-shrink-0", className)}
      style={style}
      onMouseEnter={(e: React.MouseEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.opacity = "0.82"; }}
      onMouseLeave={(e: React.MouseEvent<HTMLElement>) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
    >
      {children}
    </El>
  );
}

/* ──────────────────────────────────────────
   Mobile nav parts
─────────────────────────────────────────── */
export function MobileNav({ children, className, visible: visibleProp }: { children: React.ReactNode; className?: string; visible?: boolean }) {
  const ctx = useContext(NavContext);
  const visible = visibleProp !== undefined ? visibleProp : ctx.visible;
  return (
    <motion.div
      animate={visible ? { background: "rgba(4,4,8,0.9)", backdropFilter: "blur(20px)" } : { background: "transparent", backdropFilter: "none" }}
      transition={{ duration: 0.25 }}
      className={cn("flex md:hidden items-center justify-between px-4", className)}
      style={{ height: 56 }}
    >
      {children}
    </motion.div>
  );
}

export function MobileNavHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex w-full items-center justify-between", className)}>
      {children}
    </div>
  );
}

export function MobileNavToggle({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)", padding: 4, display: "flex", alignItems: "center" }}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isOpen ? "x" : "menu"}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.15 }}
          style={{ display: "flex", alignItems: "center" }}
        >
          {isOpen
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
            : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
          }
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export function MobileNavMenu({
  children,
  className,
  isOpen,
  onClose,
}: {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={cn("overflow-hidden", className)}
          style={{
            background: "rgba(4,4,8,0.95)",
            backdropFilter: "blur(24px)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex flex-col gap-0 px-4 pb-4 pt-2" onClick={onClose}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
