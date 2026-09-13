/**
 * React Bits — Confidence Ring
 * Animated circular progress arc that fills to the given confidence percentage.
 */
import { motion } from "motion/react";

interface Props {
  value: number;       // 0–100
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  label?: string;
}

export function ConfidenceRing({
  value,
  size = 72,
  stroke = 5,
  color = "var(--accent)",
  trackColor = "var(--bg-3)",
  label,
}: Props) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const filled = circ - (circ * value) / 100;

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {/* track */}
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        {/* fill */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: filled }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </svg>
      {/* centre label */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "Geist Mono, monospace", color: "var(--text-1)", letterSpacing: "-0.04em", lineHeight: 1 }}>
          {value}%
        </span>
        {label && (
          <span style={{ fontSize: 9, color: "var(--text-4)", marginTop: 2, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
