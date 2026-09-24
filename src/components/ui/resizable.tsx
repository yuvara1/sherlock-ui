import { Group, Panel, Separator, usePanelRef } from "react-resizable-panels";
import type { PanelImperativeHandle } from "react-resizable-panels";
import { cn } from "@/lib/utils";

/**
 * Thin wrapper — the library already sets height:100%, width:100%,
 * display:flex and flexDirection via inline style; we only add className.
 */
const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof Group>) => (
  <Group className={cn(className)} {...props} />
);

const ResizablePanel = Panel;

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
  orientation?: "horizontal" | "vertical";
  "aria-label"?: string;
}) => {
  const isVert = orientation === "vertical";
  return (
    <Separator
      aria-label={ariaLabel}
      role="separator"
      aria-orientation={isVert ? "horizontal" : "vertical"}
      className={cn("group relative flex shrink-0 items-center justify-center", className)}
      style={{
        width:  isVert ? "100%" : 1,
        height: isVert ? 1 : "100%",
        cursor: isVert ? "row-resize" : "col-resize",
        background: "var(--border)",
        transition: "background 0.15s",
        zIndex: 10,
        outline: "none",
      }}
      {...props}
    >
      {/* Visible grip pill */}
      <div style={{
        width:        isVert ? 32 : 3,
        height:       isVert ? 3 : 32,
        borderRadius: 99,
        background:   "var(--border-2)",
        transition:   "all 0.2s cubic-bezier(0.32,0.72,0,1)",
        flexShrink:   0,
      }}
        className="group-hover:!bg-muted-foreground/60 group-active:!bg-primary"
        data-handle-pill
      />
    </Separator>
  );
};

export { ResizablePanelGroup, ResizablePanel, ResizableHandle, usePanelRef };
export type { PanelImperativeHandle as ImperativePanelHandle };
