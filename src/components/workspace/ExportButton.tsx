import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

function csvCell(value: unknown) {
  let text = String(value ?? "")
  // Spreadsheet formula injection is possible even when CSV values are quoted.
  if (
    typeof value === "string" &&
    (/^\s*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text))
  )
    text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

export function createCsv<Row extends object>(rows: readonly Row[]) {
  if (!rows.length) return ""
  const columns = Object.keys(rows[0]).filter((key) =>
    rows.every((row) => {
      const value = (row as Record<string, unknown>)[key]
      return (
        value == null || ["string", "number", "boolean"].includes(typeof value)
      )
    }),
  )
  return [
    columns.map(csvCell).join(","),
    ...rows.map((row) =>
      columns
        .map((key) => csvCell((row as Record<string, unknown>)[key]))
        .join(","),
    ),
  ].join("\r\n")
}

interface ExportButtonProps<Row extends object> {
  rows: readonly Row[]
  name: string
}
export default function ExportButton<Row extends object>({
  rows,
  name,
}: ExportButtonProps<Row>) {
  function download() {
    const url = URL.createObjectURL(
      new Blob(["\uFEFF", createCsv(rows)], { type: "text/csv;charset=utf-8" }),
    )
    const link = document.createElement("a")
    link.href = url
    link.download = `sherlock-${name}.csv`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={download}
      disabled={!rows.length}
    >
      <Download size={13} aria-hidden="true" /> Export CSV
    </Button>
  )
}
