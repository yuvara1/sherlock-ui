/**
 * Aceternity UI — Resizable Navbar
 * Canonical behavior (spring shrink to a centered pill on scroll), themed
 * for Sherlock's strict black-and-white palette.
 * API: Navbar, NavBody, NavItems, MobileNav, NavbarLogo, NavbarButton,
 *      MobileNavHeader, MobileNavToggle, MobileNavMenu
 */
"use client";
import { cn } from "@/lib/utils";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";
import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";

interface NavbarProps {
  children: React.ReactNode;
  className?: string;
}
interface NavBodyProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}
interface NavItemsProps {
  items: { name: string; link: string }[];
  className?: string;
  onItemClick?: () => void;
}
interface MobileNavProps {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}
interface MobileNavHeaderProps {
  children: React.ReactNode;
  className?: string;
}
interface MobileNavMenuProps {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Navbar = ({ children, className }: NavbarProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState<boolean>(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 100);
  });

  return (
    <motion.div
      ref={ref}
      className={cn("fixed inset-x-0 top-0 z-[100] w-full", className)}
    >
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(
              child as React.ReactElement<{ visible?: boolean }>,
              { visible },
            )
          : child,
      )}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(12px)" : "none",
        boxShadow: visible
          ? "0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.55), 0 1px 0 rgba(255,255,255,0.08) inset"
          : "none",
        width: visible ? "48%" : "100%",
        y: visible ? 18 : 0,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 50 }}
      style={{ minWidth: visible ? "760px" : undefined }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full bg-transparent px-6 py-2.5 lg:flex",
        visible && "bg-[rgba(4,4,8,0.8)] px-5",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const NavItems = ({ items, className, onItemClick }: NavItemsProps) => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <motion.div
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-1 text-sm font-medium lg:flex",
        className,
      )}
    >
      {items.map((item, idx) => (
        <a
          onMouseEnter={() => setHovered(idx)}
          onClick={onItemClick}
          className="relative px-3.5 py-1.5 transition-colors duration-150"
          style={{
            color:
              hovered === idx ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.5)",
            letterSpacing: "-0.004em",
            textDecoration: "none",
          }}
          key={`link-${idx}`}
          href={item.link}
        >
          {hovered === idx && (
            <motion.div
              layoutId="nav-hovered"
              className="absolute inset-0 h-full w-full rounded-full z-10"
              style={{ background: "rgba(255,255,255,0.07)" }}
            />
          )}
          <span className="relative z-20">{item.name}</span>
        </a>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({ children, className, visible }: MobileNavProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(12px)" : "none",
        boxShadow: visible
          ? "0 0 0 1px rgba(255,255,255,0.08), 0 8px 32px rgba(0,0,0,0.55)"
          : "none",
        width: visible ? "92%" : "100%",
        paddingRight: visible ? "12px" : "16px",
        paddingLeft: visible ? "12px" : "16px",
        borderRadius: visible ? "16px" : "0px",
        y: visible ? 14 : 0,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 50 }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-1rem)] flex-col items-center justify-between bg-transparent py-2 lg:hidden",
        visible && "bg-[rgba(4,4,8,0.85)]",
        className,
      )}
    >
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({ children, className }: MobileNavHeaderProps) => {
  return (
    <div
      className={cn(
        "flex w-full flex-row items-center justify-between px-1",
        className,
      )}
    >
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose,
}: MobileNavMenuProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          onClick={onClose}
          className={cn(
            "absolute inset-x-2 top-16 z-50 flex w-[calc(100%-1rem)] flex-col items-start justify-start gap-4 rounded-2xl px-5 py-7",
            className,
          )}
          style={{
            background: "rgba(4,4,8,0.96)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 24px 68px rgba(0,0,0,0.6)",
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick,
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "rgba(255,255,255,0.8)",
        padding: 4,
        display: "flex",
        alignItems: "center",
      }}
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
          {isOpen ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
};

export const NavbarLogo = () => {
  return (
    <Link
      to="/"
      aria-label="Sherlock home"
      className="relative z-20 flex items-center gap-2"
      style={{ textDecoration: "none", flexShrink: 0 }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 7,
          background: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      </div>
      <span style={{ fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: "-0.008em" }}>
        Sherlock
      </span>
    </Link>
  );
};

type BtnVariant = "primary" | "secondary" | "dark" | "gradient";

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children: React.ReactNode;
  className?: string;
  variant?: BtnVariant;
} & (
  | React.ComponentPropsWithoutRef<"a">
  | React.ComponentPropsWithoutRef<"button">
)) => {
  const baseStyles =
    "px-5 py-2 rounded-full text-sm font-medium relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-flex items-center justify-center gap-1.5 text-center";

  const variantStyles: Record<BtnVariant, string> = {
    primary: "bg-white text-black hover:opacity-85",
    secondary: "bg-transparent text-white/70 border border-white/12 hover:text-white hover:border-white/25",
    dark: "bg-white/[0.06] text-white border border-white/10 hover:bg-white/10",
    gradient: "bg-white text-black hover:opacity-85",
  };

  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
};
