import type { HTMLAttributes, ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageHeadingProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "header"
  actions?: ReactNode
}

/** Keeps page typography and action placement consistent without owning page state. */
export default function PageHeading({
  as: Container = "div",
  actions,
  children,
  className,
  ...props
}: PageHeadingProps) {
  return (
    <Container
      className={cn("sherlock-page-heading page-heading-row", className)}
      {...props}
    >
      <div className="sherlock-heading-copy">{children}</div>
      {actions && <div className="sherlock-heading-actions">{actions}</div>}
    </Container>
  )
}
