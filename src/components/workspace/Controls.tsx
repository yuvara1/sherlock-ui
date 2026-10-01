import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useId,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react"
import { AlertCircle, Loader2 } from "lucide-react"
import { authErrorMessage } from "@/api/auth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export const inputClass =
  "w-full rounded-lg border border-[var(--border-2)] bg-[var(--bg)] px-3 py-2 text-sm text-[var(--text-1)] outline-none focus:border-[var(--accent)] disabled:opacity-50"
export const panelClass =
  "rounded-xl border border-[var(--border)] bg-[var(--bg-2)]"

export function Button({
  children,
  primary,
  danger,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  primary?: boolean
  danger?: boolean
}) {
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        primary
          ? "border-transparent bg-[var(--accent)] text-white hover:opacity-90"
          : danger
            ? "border-[var(--red-border)] text-[var(--red)] hover:bg-[var(--red-bg)]"
            : "border-[var(--border)] text-[var(--text-2)] hover:bg-[var(--bg-3)]"
      } ${className}`}
    >
      {children}
    </button>
  )
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string
  children: ReactNode
  hint?: string
}) {
  const fieldId = useId()
  const directControl = isValidElement(children) && typeof children.type === "string" && ["input", "select", "textarea"].includes(children.type)
  return (
    <div className="block space-y-2 text-sm text-[var(--text-2)]">
      <label htmlFor={directControl ? fieldId : undefined} className="block font-medium">{label}</label>
      {directControl ? cloneElement(children as ReactElement<{ id: string; "aria-describedby"?: string }>, { id: fieldId, "aria-describedby": hint ? `${fieldId}-hint` : undefined }) : children}
      {hint && (
        <span id={`${fieldId}-hint`} className="block text-xs text-[var(--text-4)]">{hint}</span>
      )}
    </div>
  )
}

export function Notice({
  message,
  success = false,
}: {
  message: string
  success?: boolean
}) {
  if (!message) return null
  return (
    <div
      role={success ? "status" : "alert"}
      className={`flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm ${
        success
          ? "border-[var(--green-border)] bg-[var(--green-bg)] text-[var(--green)]"
          : "border-[var(--red-border)] bg-[var(--red-bg)] text-[var(--red)]"
      }`}
    >
      <AlertCircle size={15} className="mt-0.5 shrink-0" />
      {message}
    </div>
  )
}

export function Loading() {
  return (
    <div
      role="status"
      className="flex items-center gap-2 py-8 text-sm text-[var(--text-3)]"
    >
      <Loader2 size={16} className="animate-spin" />
      Loading workspace data…
    </div>
  )
}

export function FormDialog({
  title,
  description,
  open,
  onOpenChange,
  children,
}: {
  title: string
  description: string
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[var(--border)] bg-[var(--bg-2)] text-[var(--text-1)]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-[var(--text-3)]">
            {description}
          </DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

export function useResource<T>(loader: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const version = useRef(0)
  const reload = useCallback(async () => {
    const request = ++version.current
    setLoading(true)
    setError("")
    try {
      const result = await loader()
      if (request === version.current) setData(result)
    } catch (failure) {
      if (request === version.current) setError(authErrorMessage(failure))
    } finally {
      if (request === version.current) setLoading(false)
    }
  }, [loader])
  useEffect(() => {
    void reload()
    return () => {
      version.current += 1
    }
  }, [reload])
  return { data, error, loading, reload }
}
