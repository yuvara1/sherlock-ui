import React, { useState, type SVGProps } from "react"
import { motion, useMotionValueEvent, useScroll } from "motion/react"
import { cn } from "@/lib/utils"

export const StickyBanner = ({
  className,
  children,
  hideOnScroll = false,
  removeOnClose = false,
  sticky = true,
}: {
  className?: string
  children: React.ReactNode
  hideOnScroll?: boolean
  removeOnClose?: boolean
  sticky?: boolean
}) => {
  const [open, setOpen] = useState(true)
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (!hideOnScroll) return
    if (hideOnScroll && latest > 40) {
      setOpen(false)
    } else {
      setOpen(true)
    }
  })

  if (!open && removeOnClose) return null

  return (
    <motion.div
      className={cn(
        "flex min-h-14 w-full items-center justify-center bg-transparent px-4 py-1",
        sticky ? "sticky inset-x-0 top-0 z-40" : "relative",
        className,
      )}
      initial={{
        y: -100,
        opacity: 0,
      }}
      animate={{
        y: open ? 0 : -100,
        opacity: open ? 1 : 0,
      }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
    >
      {children}

      <motion.button
        type="button"
        aria-label={open ? "Dismiss announcement" : "Show announcement"}
        initial={{
          scale: 0,
        }}
        animate={{
          scale: 1,
        }}
        className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <CloseIcon className="h-5 w-5 text-white" />
      </motion.button>
    </motion.div>
  )
}

const CloseIcon = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </svg>
  )
}
