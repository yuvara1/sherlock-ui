"use client"
import React, { useState } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
export const WobbleCard = ({
  children,
  containerClassName,
  className,
}: {
  children: React.ReactNode
  containerClassName?: string
  className?: string
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = event
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (clientX - (rect.left + rect.width / 2)) / 20
    const y = (clientY - (rect.top + rect.height / 2)) / 20
    setMousePosition({ x, y })
  }
  return (
    <motion.section
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false)
        setMousePosition({ x: 0, y: 0 })
      }}
      style={{
        transform: isHovering
          ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1, 1, 1)`
          : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
      }}
      className={[
        cn(
          "mx-auto w-full relative rounded-2xl overflow-hidden",
          containerClassName,
        ),
        "[transition:transform_0.1s_ease-out]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative  h-full [background-image:radial-gradient(88%_100%_at_top,rgba(255,255,255,0.5),rgba(255,255,255,0))]  sm:mx-0 sm:rounded-2xl overflow-hidden [box-shadow:0_10px_32px_rgba(34,_42,_53,_0.12),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.05),_0_4px_6px_rgba(34,_42,_53,_0.08),_0_24px_108px_rgba(47,_48,_55,_0.10)]">
        <motion.div
          style={{
            transform: isHovering
              ? `translate3d(${-mousePosition.x}px, ${-mousePosition.y}px, 0) scale3d(1.03, 1.03, 1)`
              : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
          }}
          className={[
            cn("h-full px-4 py-20 sm:px-10", className),
            "[transition:transform_0.1s_ease-out]",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <Noise />
          {children}
        </motion.div>
      </div>
    </motion.section>
  )
}
const Noise = () => {
  return (
    <div className="absolute inset-0 w-full h-full scale-[1.2] transform opacity-10 [mask-image:radial-gradient(#fff,transparent,75%)] [background-image:url(/noise.webp)] [background-size:30%]"></div>
  )
}
