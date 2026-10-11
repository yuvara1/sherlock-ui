import { useState } from "react"

/** Local UI preferences only; never stores credentials or workspace records. */
export default function useLocalList(key: string, allowed: readonly string[]) {
  const [items, setItems] = useState<string[]>(() => {
    try {
      const value: unknown = JSON.parse(localStorage.getItem(key) ?? "[]")
      return Array.isArray(value)
        ? [
            ...new Set(
              value.filter(
                (item): item is string =>
                  typeof item === "string" && allowed.includes(item),
              ),
            ),
          ]
        : []
    } catch {
      return []
    }
  })
  const [persistent, setPersistent] = useState(true)

  function toggle(item: string) {
    if (!allowed.includes(item)) return
    const next = items.includes(item)
      ? items.filter((value) => value !== item)
      : [...items, item]
    setItems(next)
    try {
      localStorage.setItem(key, JSON.stringify(next))
      setPersistent(true)
    } catch {
      setPersistent(false)
    }
  }

  return { items, toggle, persistent }
}
