/**
 * React Bits — Confidence Ring
 * Animated circular progress arc that fills to the given confidence percentage.
 */
import { motion } from "motion/react"
interface Props {
  value: number // 0–100
  size?: number
  stroke?: number
  color?: string
  trackColor?: string
  label?: string
}
export function ConfidenceRing({
  value,
  size = 72,
  stroke = 5,
  color = "var(--accent)",
  trackColor = "var(--bg-3)",
  label,
}: Props) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  const filled = circ - (circ * value) / 100
  return (
    <div
      style={{
        width: size,
        height: size,
      }}
      className="[position:relative] [flex-shrink:0]"
    >
      <svg width={size} height={size} className="[transform:rotate(-90deg)]">
        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={trackColor}
          strokeWidth={stroke}
        />
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
      <div className="[position:absolute] [inset:0] [display:flex] [flex-direction:column] [align-items:center] [justify-content:center]">
        <span className="[font-size:15px] [font-weight:700] [font-family:Geist_Mono,_monospace] [color:var(--text-1)] [letter-spacing:-0.04em] [line-height:1]">
          {value}%
        </span>
        {label && (
          <span className="[font-size:9px] [color:var(--text-4)] [margin-top:2px] [letter-spacing:0.04em] [text-transform:uppercase]">
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
