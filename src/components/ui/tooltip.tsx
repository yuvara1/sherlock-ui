import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider
const Tooltip = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent =
  React.forwardRef<React.ElementRef<typeof TooltipPrimitive.Content>, React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>>(
    ({ className, sideOffset = 6, ...props }, ref) => (
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          ref={ref}
          sideOffset={sideOffset}
          className={cn(
            "z-[9999] max-w-[220px] origin-[var(--radix-tooltip-content-transform-origin)] overflow-hidden whitespace-nowrap rounded-md border border-[var(--border)] bg-[var(--bg-inv)] px-[9px] py-1 text-xs font-medium leading-normal tracking-[-0.004em] text-[var(--bg)] shadow-[0_4px_16px_rgba(0,0,0,0.18),0_1px_4px_rgba(0,0,0,0.12)] animate-[tooltip-in_0.12s_ease]",
            className,
          )}
          {...props}
        />
      </TooltipPrimitive.Portal>
    ),
  )
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
