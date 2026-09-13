import { Check, ChevronDown } from "lucide-react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

export interface SelectOption {
  value: string;
  label: string;
  badge?: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

interface SherlockSelectProps {
  value: string;
  onChange: (value: string) => void;
  /** Flat list — or use `groups` for grouped sections */
  options?: (string | SelectOption)[];
  /** Grouped sections matching the image template */
  groups?: SelectGroup[];
  placeholder?: string;
  align?: "start" | "center" | "end";
  minWidth?: number | string;
}

function normalize(o: string | SelectOption): SelectOption {
  return typeof o === "string" ? { value: o, label: o } : o;
}

function currentLabel(
  value: string,
  options?: (string | SelectOption)[],
  groups?: SelectGroup[],
  placeholder?: string,
): string {
  if (options) {
    const found = options.map(normalize).find(o => o.value === value);
    return found?.label ?? placeholder ?? value;
  }
  if (groups) {
    for (const g of groups) {
      const found = g.options.find(o => o.value === value);
      if (found) return found.label;
    }
  }
  return placeholder ?? value;
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
  const label = currentLabel(value, options, groups, placeholder);

  const flatOptions = options ? options.map(normalize) : undefined;

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <button
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 10px",
            borderRadius: 7,
            border: "1px solid var(--border)",
            background: "var(--bg-2)",
            color: "var(--text-3)",
            fontSize: 12,
            fontFamily: "Geist Mono, monospace",
            cursor: "pointer",
            outline: "none",
            whiteSpace: "nowrap",
            minWidth: typeof minWidth === "number" ? minWidth : undefined,
            width: typeof minWidth === "string" ? minWidth : undefined,
            justifyContent: "space-between",
            transition: "border-color 0.15s, color 0.15s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-2)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-2)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)";
          }}
        >
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>
          <ChevronDown size={11} style={{ color: "var(--text-4)", flexShrink: 0 }} />
        </button>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={5}
          data-sherlock-dropdown
          style={{
            minWidth: typeof minWidth === "number" ? minWidth : 180,
            zIndex: 9999,
            // Animation
            transformOrigin: "var(--radix-dropdown-menu-content-transform-origin)",
          }}
          className="
            data-[state=open]:animate-in
            data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0
            data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95
            data-[state=open]:zoom-in-95
            data-[side=bottom]:slide-in-from-top-1
            data-[side=top]:slide-in-from-bottom-1
          "
        >
          <DropdownMenuPrimitive.RadioGroup value={value} onValueChange={onChange}>
            {/* Flat options */}
            {flatOptions && flatOptions.map((opt, i) => (
              <DropdownMenuPrimitive.RadioItem
                key={opt.value}
                value={opt.value}
                data-sherlock-item
                style={{ position: "relative" }}
              >
                <span>{opt.label}</span>
                <DropdownMenuPrimitive.ItemIndicator>
                  <Check size={11} style={{ color: "var(--text-2)" }} />
                </DropdownMenuPrimitive.ItemIndicator>
              </DropdownMenuPrimitive.RadioItem>
            ))}

            {/* Grouped options — matches image template */}
            {groups && groups.map((group, gi) => (
              <DropdownMenuPrimitive.Group key={group.label}>
                {gi > 0 && <div data-sherlock-sep />}
                <div data-sherlock-label>{group.label}</div>
                {group.options.map(opt => (
                  <DropdownMenuPrimitive.RadioItem
                    key={opt.value}
                    value={opt.value}
                    data-sherlock-item
                    style={{ position: "relative" }}
                  >
                    <span>{opt.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {opt.badge && (
                        <span style={{
                          fontSize: 10,
                          padding: "1px 5px",
                          borderRadius: 4,
                          border: "1px solid var(--border)",
                          color: "var(--text-4)",
                          background: "var(--bg-3)",
                        }}>{opt.badge}</span>
                      )}
                      <DropdownMenuPrimitive.ItemIndicator>
                        <Check size={11} style={{ color: "var(--text-2)" }} />
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
  );
}
