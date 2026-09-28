import { Group, Panel, Separator, usePanelRef } from "react-resizable-panels"
import type { PanelImperativeHandle } from "react-resizable-panels"
import { cn } from "@/lib/utils"
/**
 * Thin wrapper — the library already sets height:100%, width:100%,
 * display:flex and flexDirection via inline style; we only add className.
 */
const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof Group>) => (
  <Group className={cn(className)} {...props} />
)
const ResizablePanel = Panel
/**
 * Drag handle with a visible pill grip indicator.
 * Works for both horizontal (sidebar | main) and vertical (top | bottom) splits.
 */
const ResizableHandle = ({
  className,
  orientation = "horizontal",
  "aria-label": ariaLabel = "Resize panels",
  ...props
}: React.ComponentProps<typeof Separator> & {
  orientation?: "horizontal" | "vertical"
  "aria-label"?: string
}) => {
  const isVert = orientation === "vertical"
  return (
    <Separator
      aria-label={ariaLabel}
      role="separator"
      aria-orientation={isVert ? "horizontal" : "vertical"}
      {...props}
      className={[
        cn(
          "group relative flex shrink-0 items-center justify-center",
          className,
        ),
        "[background:var(--border)] [transition:background_0.15s] [z-index:10] [outline:none]",
        isVert ? "[width:100%]" : "[width:1px]",
        isVert ? "[height:1px]" : "[height:100%]",
        isVert ? "[cursor:row-resize]" : "[cursor:col-resize]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Visible grip pill */}
      <div
        data-handle-pill
        className={[
          "group-hover:!bg-muted-foreground/60 group-active:!bg-primary",
          "[border-radius:99px] [background:var(--border-2)] [transition:all_0.2s_cubic-bezier(0.32,0.72,0,1)] [flex-shrink:0]",
          isVert ? "[width:32px]" : "[width:3px]",
          isVert ? "[height:3px]" : "[height:32px]",
        ]
          .filter(Boolean)
          .join(" ")}
      />
    </Separator>
  )
}
export { ResizablePanelGroup, ResizablePanel, ResizableHandle, usePanelRef }
export type { PanelImperativeHandle as ImperativePanelHandle }
