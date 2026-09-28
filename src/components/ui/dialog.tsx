import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

const DialogOverlay =
  React.forwardRef<React.ElementRef<typeof DialogPrimitive.Overlay>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>>(
    ({ className, ...props }, ref) => (
      <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
          "fixed inset-0 z-[200] bg-black/50 backdrop-blur-[2px] animate-[dialog-overlay-in_0.15s_ease] data-[state=closed]:animate-[dialog-overlay-out_0.15s_ease_forwards]",
          className,
        )}
        {...props}
      />
    ),
  )
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent =
  React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean
  }>(({ className, children, showCloseButton = true, ...props }, ref) => (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-1/2 top-1/2 z-[201] w-[min(480px,calc(100vw-32px))] max-h-[calc(100vh-64px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--bg-2)] p-0 shadow-[0_24px_64px_rgba(0,0,0,0.24),0_4px_16px_rgba(0,0,0,0.12)] outline-none animate-[dialog-in_0.18s_cubic-bezier(0.4,0,0.2,1)] data-[state=closed]:animate-[dialog-out_0.15s_cubic-bezier(0.4,0,0.2,1)_forwards]",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close className="absolute right-3.5 top-3.5 flex size-6 cursor-pointer items-center justify-center rounded-[5px] border border-[var(--border)] bg-transparent text-[var(--text-4)] transition-colors hover:border-[var(--border-2)] hover:bg-[var(--bg-3)] hover:text-[var(--text-1)]">
            <X size={14} />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  ))
DialogContent.displayName = DialogPrimitive.Content.displayName

function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col gap-1 px-5 pt-5", className)}
      {...props}
    />
  )
}
DialogHeader.displayName = "DialogHeader"

function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mt-1 flex items-center justify-end gap-2 border-t border-[var(--border)] px-5 pb-5 pt-4",
        className,
      )}
      {...props}
    />
  )
}
DialogFooter.displayName = "DialogFooter"

const DialogTitle =
  React.forwardRef<React.ElementRef<typeof DialogPrimitive.Title>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>>(
    ({ className, ...props }, ref) => (
      <DialogPrimitive.Title
        ref={ref}
        className={cn(
          "m-0 pr-7 text-[15px] font-semibold leading-normal tracking-[-0.015em] text-[var(--text-1)]",
          className,
        )}
        {...props}
      />
    ),
  )
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription =
  React.forwardRef<React.ElementRef<typeof DialogPrimitive.Description>, React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>>(
    ({ className, ...props }, ref) => (
      <DialogPrimitive.Description
        ref={ref}
        className={cn(
          "m-0 text-[13px] leading-normal tracking-[-0.004em] text-[var(--text-3)]",
          className,
        )}
        {...props}
      />
    ),
  )
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
