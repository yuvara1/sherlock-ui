/**
 * React Bits — Fade In
 * Children fade + slide in on mount with optional stagger for lists.
 */
import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
  duration?: number;
  y?: number;
}

export function FadeIn({ children, className, style, delay = 0, duration = 0.3, y = 8 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, ease: "easeOut", delay }}
      className={cn(className)}
      style={style}
    >
      {children}
    </motion.div>
  );
}

export function FadeInList({
  children,
  className,
  stagger = 0.06,
}: {
  children: ReactNode[];
  className?: string;
  stagger?: number;
}) {
  return (
    <div className={cn(className)}>
      {children.map((child, i) => (
        <FadeIn key={i} delay={i * stagger}>
          {child}
        </FadeIn>
      ))}
    </div>
  );
}
