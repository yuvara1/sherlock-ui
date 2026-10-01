import { Check, ChevronDown } from "lucide-react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
export interface SelectOption {
  value: string
  label: string
  badge?: string
}
export interface SelectGroup {
  label: string
  options: SelectOption[]
}
interface SherlockSelectProps {
  value: string
  onChange: (value: string) => void
  /** Flat list — or use `groups` for grouped sections */
  options?: (string | SelectOption)[]
  /** Grouped sections matching the image template */
  groups?: SelectGroup[]
  placeholder?: string
  align?: "start" | "center" | "end"
  minWidth?: number | string
}
function normalize(o: string | SelectOption): SelectOption {
  return typeof o === "string" ? { value: o, label: o } : o
}
function currentLabel(
  value: string,
  options?: (string | SelectOption)[],
  groups?: SelectGroup[],
  placeholder?: string,
): string {
  if (options) {
    const found = options.map(normalize).find((o) => o.value === value)
    return found?.label ?? placeholder ?? value
  }
  if (groups) {
    for (const g of groups) {
      const found = g.options.find((o) => o.value === value)
      if (found) return found.label
    }
  }
  return placeholder ?? value
}
export function SherlockSelect({
  value,
  onChange,
  options,
  groups,
  placeholder = "Select…",
  align = "start",
  minWidth = 160,
}: SherlockSelectProps) {
  const label = currentLabel(value, options, groups, placeholder)
  const flatOptions = options ? options.map(normalize) : undefined
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          style={{
            minWidth: typeof minWidth === "number" ? minWidth : undefined,
            width: typeof minWidth === "string" ? minWidth : undefined,
          }}
          className="[display:inline-flex] [align-items:center] [gap:6px] [padding:5px_10px] [border-radius:7px] [border:1px_solid_var(--border)] [background:var(--bg-2)] [color:var(--text-3)] [font-size:12px] [font-family:Geist_Mono,_monospace] [cursor:pointer] [outline:none] [white-space:nowrap] [justify-content:space-between] [transition:border-color_0.15s,_color_0.15s] hover:[border-color:var(--border-2)] hover:[color:var(--text-2)]"
        >
          <span className="[overflow:hidden] [text-overflow:ellipsis]">
            {label}
          </span>
          <ChevronDown
            size={11}
            className="[color:var(--text-4)] [flex-shrink:0]"
          />
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={5}
          style={{
            minWidth: typeof minWidth === "number" ? minWidth : 180,
          }}
          className="&#xA;            data-[state=open]:animate-in&#xA;            data-[state=closed]:animate-out&#xA;            data-[state=closed]:fade-out-0&#xA;            data-[state=open]:fade-in-0&#xA;            data-[state=closed]:zoom-out-95&#xA;            data-[state=open]:zoom-in-95&#xA;            data-[side=bottom]:slide-in-from-top-1&#xA;            data-[side=top]:slide-in-from-bottom-1&#xA;           [z-index:9999] [transform-origin:var(--radix-dropdown-menu-content-transform-origin)] [background:var(--bg-2)] [border:1px_solid_var(--border)] [border-radius:10px] [box-shadow:0_8px_32px_rgba(0,0,0,0.18),0_2px_8px_rgba(0,0,0,0.1)] [padding:4px] [font-family:Geist_Mono,_monospace]"
        >
          <DropdownMenuPrimitive.RadioGroup
            value={value}
            onValueChange={onChange}
          >
            {/* Flat options */}
            {flatOptions &&
              flatOptions.map((opt, i) => (
                <DropdownMenuPrimitive.RadioItem
                  key={opt.value}
                  value={opt.value}
                  className="[position:relative] [display:flex] [align-items:center] [justify-content:space-between] [gap:20px] [padding:6px_10px] [border-radius:6px] [font-size:12px] [color:var(--text-2)] [cursor:pointer] [outline:none] [user-select:none] hover:[background:var(--bg-3)] hover:[color:var(--text-1)] focus:[background:var(--bg-3)] focus:[color:var(--text-1)] data-[state=checked]:[color:var(--text-1)]"
                >
                  <span>{opt.label}</span>
                  <DropdownMenuPrimitive.ItemIndicator>
                    <Check size={11} className="[color:var(--text-2)]" />
                  </DropdownMenuPrimitive.ItemIndicator>
                </DropdownMenuPrimitive.RadioItem>
              ))}

            {/* Grouped options — matches image template */}
            {groups &&
              groups.map((group, gi) => (
                <DropdownMenuPrimitive.Group key={group.label}>
                  {gi > 0 && <div className="my-1 h-px bg-[var(--border)]" />}
                  <div className="px-2.5 pb-1 pt-1.5 text-[10px] font-medium uppercase tracking-[0.06em] text-[var(--text-4)]">
                    {group.label}
                  </div>
                  {group.options.map((opt) => (
                    <DropdownMenuPrimitive.RadioItem
                      key={opt.value}
                      value={opt.value}
                      className="[position:relative] [display:flex] [align-items:center] [justify-content:space-between] [gap:20px] [padding:6px_10px] [border-radius:6px] [font-size:12px] [color:var(--text-2)] [cursor:pointer] [outline:none] [user-select:none] hover:[background:var(--bg-3)] hover:[color:var(--text-1)] focus:[background:var(--bg-3)] focus:[color:var(--text-1)] data-[state=checked]:[color:var(--text-1)]"
                    >
                      <span>{opt.label}</span>
                      <div className="[display:flex] [align-items:center] [gap:6px]">
                        {opt.badge && (
                          <span className="[font-size:10px] [padding:1px_5px] [border-radius:4px] [border:1px_solid_var(--border)] [color:var(--text-4)] [background:var(--bg-3)]">
                            {opt.badge}
                          </span>
                        )}
                        <DropdownMenuPrimitive.ItemIndicator>
                          <Check size={11} className="[color:var(--text-2)]" />
                        </DropdownMenuPrimitive.ItemIndicator>
                      </div>
                    </DropdownMenuPrimitive.RadioItem>
                  ))}
                </DropdownMenuPrimitive.Group>
              ))}
          </DropdownMenuPrimitive.RadioGroup>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}
