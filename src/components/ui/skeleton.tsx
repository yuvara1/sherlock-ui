import { cn } from "@/lib/utils"
function Skeleton({
  className,
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      style={{
        ...style,
        ...style,
      }}
      className={[
        [
          cn(
            "bg-[linear-gradient(90deg,var(--bg-3)_0%,var(--bg-2)_40%,var(--border-2)_50%,var(--bg-2)_60%,var(--bg-3)_100%)] bg-[length:200%_100%] animate-[shimmer_1.6s_ease-in-out_infinite] rounded-md",
            className,
          ),
          "[min-height:8px]",
        ]
          .filter(Boolean)
          .join(" "),
        "[min-height:8px]",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  )
}
export { Skeleton }
