/**
 * React Bits — Animated Counter
 * Counts up from 0 to `value` on mount using a spring animation.
 */
import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "motion/react";

interface Props {
  value: number;
  duration?: number;
  decimals?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function AnimatedCounter({
  value,
  duration = 1.4,
  decimals = 0,
  className,
  prefix = "",
  suffix = "",
}: Props) {
  const spring = useSpring(0, { stiffness: 60, damping: 18 });
  const display = useTransform(spring, (v) =>
    `${prefix}${v.toFixed(decimals)}${suffix}`,
  );

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span className={className}>{display}</motion.span>;
}
