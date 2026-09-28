import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Editor from "@monaco-editor/react"
import {
  Copy,
  Check,
  Plus,
  Search,
  Trash2,
  Send,
  Loader2,
  X,
  WrapText,
  History as HistoryIcon,
  FolderOpen,
  Save,
  Globe,
  TerminalSquare,
  Download,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Star,
} from "lucide-react"
import { useTheme } from "@/lib/theme"
import { SherlockSelect } from "@/components/ui/SherlockSelect"
/* ─── Constants ─── */
const MONO = "Geist Mono, monospace"
const SANS = "Geist, sans-serif"
const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"]
const METHODS_WITH_BODY = new Set(["POST", "PUT", "PATCH", "DELETE", "OPTIONS"])
const METHOD_COLORS: Record<string, string> = {
  GET: "var(--accent)",
  POST: "var(--green)",
  PUT: "var(--yellow)",
  PATCH: "#8b5cf6",
  DELETE: "var(--red)",
  HEAD: "var(--text-3)",
  OPTIONS: "var(--text-3)",
}
const SAMPLE_URLS = [
  {
    label: "JSONPlaceholder · posts",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    method: "GET",
  },
  {
    label: "JSONPlaceholder · create",
    url: "https://jsonplaceholder.typicode.com/posts",
    method: "POST",
  },
  { label: "httpbin · GET", url: "https://httpbin.org/get", method: "GET" },
  { label: "httpbin · POST", url: "https://httpbin.org/post", method: "POST" },
  { label: "GitHub · Zen", url: "https://api.github.com/zen", method: "GET" },
]
const LS = {
  tabs: "sherlock.api.tabs.v2",
  history: "sherlock.api.history.v2",
  collections: "sherlock.api.collections.v2",
  envs: "sherlock.api.envs.v2",
  activeEnv: "sherlock.api.activeEnv.v2",
}
/* ─── Types ─── */
interface KV {
  id: string
  key: string
  val: string
  on: boolean
  type?: "text" | "file"
  file?: File
}
type AuthType = "none" | "bearer" | "basic" | "apikey"
type BodyType = "none" | "raw" | "form-data" | "urlencoded" | "graphql"
type RawLang = "json" | "text" | "xml" | "html" | "javascript"
type TestKind = "status" | "time" | "bodyContains" | "jsonEquals" | "headerExists"
interface TestRow {
  id: string
  kind: TestKind
  target: string
  value: string
  on: boolean
}
interface TestResult {
  name: string
  passed: boolean
  detail: string
}
interface ReqState {
  method: string
  url: string
  params: KV[]
  headers: KV[]
  authType: AuthType
  bearer: string
  basicUser: string
  basicPass: string
  apiKeyName: string
  apiKeyValue: string
  apiKeyIn: "header" | "query"
  bodyType: BodyType
  rawLang: RawLang
  rawBody: string
  formData: KV[]
  urlencoded: KV[]
  graphqlQuery: string
  graphqlVars: string
  tests: TestRow[]
}
interface ApiResponse {
  status: number
  statusText: string
  ok: boolean
  timeMs: number
  sizeBytes: number
  contentType: string
  headers: [string, string][]
  body: string
  blobUrl: string
  isJson: boolean
  isHtml: boolean
  isImage: boolean
  error?: string
  tests: TestResult[]
}
interface Tab {
  id: string
  name: string
  req: ReqState
  response: ApiResponse | null
  loading: boolean
  dirty: boolean
}
interface HistoryItem {
  id: string
  method: string
  url: string
  status: number | null
  ok: boolean
  timeMs: number | null
  ts: number
  error?: boolean
}
interface SavedRequest {
  id: string
  name: string
  req: ReqState
}
interface Collection {
  id: string
  name: string
  requests: SavedRequest[]
}
interface Environment {
  id: string
  name: string
  vars: KV[]
}
/* ─── Helpers ─── */
const uid = () => Math.random().toString(36).slice(2, 9)
const emptyRow = (): KV => ({
  id: uid(),
  key: "",
  val: "",
  on: true,
  type: "text",
})
function newReq(partial?: Partial<ReqState>): ReqState {
  return {
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    params: [emptyRow()],
    headers: [
      {
        id: uid(),
        key: "Accept",
        val: "application/json",
        on: true,
        type: "text",
      },
    ],
    authType: "none",
    bearer: "",
    basicUser: "",
    basicPass: "",
    apiKeyName: "X-API-Key",
    apiKeyValue: "",
    apiKeyIn: "header",
    bodyType: "none",
    rawLang: "json",
    rawBody: '{\n  "title": "Sherlock",\n  "completed": false\n}',
    formData: [emptyRow()],
    urlencoded: [emptyRow()],
    graphqlQuery: "query {\n  \n}",
    graphqlVars: "{}",
    tests: [],
    ...partial,
  }
}
function newTab(req?: ReqState): Tab {
  const r = req ?? newReq()
  return {
    id: uid(),
    name: tabName(r),
    req: r,
    response: null,
    loading: false,
    dirty: false,
  }
}
function tabName(r: ReqState) {
  try {
    const u = new URL(r.url)
    const seg = u.pathname.split("/").filter(Boolean).pop()
    return seg || u.hostname
  } catch {
    return r.url.slice(0, 18) || "New Request"
  }
}
function fmtMs(ms: number | null) {
  if (ms == null) return "—"
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`
}
function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(2)} MB`
}
function statusColor(code: number) {
  if (code === 0) return "var(--red)"
  if (code < 300) return "var(--green)"
  if (code < 400) return "var(--accent)"
  if (code < 500) return "var(--yellow)"
  return "var(--red)"
}
function methodColor(m: string) {
  return METHOD_COLORS[m] ?? "var(--text-3)"
}
function relTime(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}
function requestStateFromUrl(url: string): Pick<ReqState, "url" | "params"> {
  try {
    const parsed = new URL(url)
    const params = Array.from(parsed.searchParams.entries(), ([key, val]) => ({
      id: uid(),
      key,
      val,
      on: true,
      type: "text" as const,
    }))
    parsed.search = ""
    return {
      url: parsed.toString(),
      params: params.length ? params : [emptyRow()],
    }
  } catch {
    return { url, params: [emptyRow()] }
  }
}
/** Substitute {{var}} tokens using the active environment. */
function resolveVars(str: string, vars: Record<string, string>) {
  return str.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, k) =>
    k in vars ? vars[k] : `{{${k}}}`,
  )
}
/** Get a value from parsed JSON via a dotted path (supports [i]). */
function jsonPath(obj: unknown, path: string): unknown {
  const parts = path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean)
  let cur: unknown = obj
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined
    cur = (cur as Record<string, unknown>)[p]
  }
  return cur
}
function buildCurl(
  r: ReqState,
  finalUrl: string,
  headers: Record<string, string>,
  bodyStr?: string,
) {
  const parts = [`curl -X ${r.method} '${finalUrl}'`]
  Object.entries(headers).forEach(([k, v]) => parts.push(`  -H '${k}: ${v}'`))
  if (bodyStr) parts.push(`  --data '${bodyStr.replace(/'/g, "'\\''")}'`)
  return parts.join(" \\\n")
}
function parseCurl(text: string): Partial<ReqState> | null {
  const t = text.trim().replace(/\\\n/g, " ")
  if (!/^curl\b/.test(t)) return null
  const out: Partial<ReqState> = { headers: [], params: [emptyRow()] }
  const methodM = t.match(/-X\s+(\w+)/)
  if (methodM) out.method = methodM[1].toUpperCase()
  // url: first quoted or bare http token
  const urlM = t.match(
    /'(https?:\/\/[^']+)'|"(https?:\/\/[^"]+)"|\s(https?:\/\/\S+)/,
  )
  if (urlM) out.url = (urlM[1] || urlM[2] || urlM[3]).trim()
  const headers: KV[] = []
  const hRe = /-H\s+'([^']+)'|-H\s+"([^"]+)"/g
  let m: RegExpExecArray | null
  while ((m = hRe.exec(t))) {
    const raw = m[1] || m[2]
    const idx = raw.indexOf(":")
    if (idx > -1)
      headers.push({
        id: uid(),
        key: raw.slice(0, idx).trim(),
        val: raw.slice(idx + 1).trim(),
        on: true,
        type: "text",
      })
  }
  out.headers = headers.length ? headers : [emptyRow()]
  const dataM = t.match(
    /(?:--data|--data-raw|-d)\s+'([^']*)'|(?:--data|--data-raw|-d)\s+"([^"]*)"/,
  )
  if (dataM) {
    out.bodyType = "raw"
    out.rawLang = "json"
    out.rawBody = dataM[1] || dataM[2] || ""
    if (!out.method) out.method = "POST"
  }
  return out
}
function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  } catch {
    return fallback
  }
}
function saveLS(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val))
  } catch {
    /* ignore */
  }
}
/** Strip File objects (non-serializable) before persisting. */
function sanitizeReq(r: ReqState): ReqState {
  return {
    ...r,
    formData: r.formData.map((row) => ({ ...row, file: undefined })),
  }
}
/* ─── Atoms ─── */
function MethodTag({ method, size = 10 }: { method: string size?: number }) {
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: size,
        color: methodColor(method),
      }}
      className="[font-weight:700] [letter-spacing:0.04em] [flex-shrink:0]"
    >
      {method}
    </span>
  )
}
function IconBtn({
  onClick,
  title,
  children,
  active,
  danger,
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
  active?: boolean
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        fontFamily: SANS,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--bg-3)"
        if (!danger) e.currentTarget.style.color = "var(--text-1)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = active
          ? "var(--bg-3)"
          : "transparent"
        if (!danger) e.currentTarget.style.color = "var(--text-3)"
      }}
      className={[
        "[display:flex] [align-items:center] [gap:5px] [height:30px] [padding:0_10px] [border-radius:6px] [border:1px_solid_var(--border)] [font-size:12px] [cursor:pointer] [white-space:nowrap] [transition:background_0.1s,_color_0.1s]",
        active ? "[background:var(--bg-3)]" : "[background:transparent]",
        danger ? "[color:var(--red)]" : "[color:var(--text-3)]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  )
}
function CopyBtn({ value, label = "Copy" }: { value: string label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(value).catch(() => {})
        setCopied(true)
        setTimeout(() => setCopied(false), 1400)
      }}
      style={{
        fontFamily: MONO,
      }}
      className={[
        "[display:flex] [align-items:center] [gap:4px] [padding:3px_8px] [border-radius:5px] [border:1px_solid_var(--border)] [background:transparent] [cursor:pointer] [font-size:10px]",
        copied ? "[color:var(--green)]" : "[color:var(--text-4)]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
      {copied ? "Copied" : label}
    </button>
  )
}
/* ─── Key/Value editor ─── */
function KVEditor({
  rows,
  setRows,
  keyPlaceholder = "Key",
  valPlaceholder = "Value",
  allowFiles = false,
}: {
  rows: KV[]
  setRows: (r: KV[]) => void
  keyPlaceholder?: string
  valPlaceholder?: string
  allowFiles?: boolean
}) {
  const update = (id: string, patch: Partial<KV>) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const remove = (id: string) => setRows(rows.filter((r) => r.id !== id))
  const inputStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: 12,
    fontFamily: MONO,
    color: "var(--text-1)",
    padding: "8px 10px",
  }
  return (
    <div>
      {rows.map((r) => (
        <div
          key={r.id}
          className={[
            "[display:flex] [align-items:center] [border-bottom:1px_solid_var(--border)]",
            r.on ? "[background:transparent]" : "[background:var(--bg-2)]",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <input
            type="checkbox"
            checked={r.on}
            onChange={(e) => update(r.id, { on: e.target.checked })}
            aria-label="Enable row"
            className="[margin:0_8px] [accent-color:var(--accent)] [flex-shrink:0]"
          />
          <input
            value={r.key}
            onChange={(e) => update(r.id, { key: e.target.value })}
            placeholder={keyPlaceholder}
            style={{
              ...inputStyle,
            }}
            spellCheck={false}
            className="[border-right:1px_solid_var(--border)]"
          />
          {allowFiles && r.type === "file" ? (
            <label
              style={{
                ...inputStyle,
              }}
              className="[display:flex] [align-items:center] [gap:6px] [cursor:pointer] [color:var(--text-3)]"
            >
              {r.file ? r.file.name : "Choose file…"}
              <input
                type="file"
                onChange={(e) =>
                  update(r.id, {
                    file: e.target.files?.[0],
                    val: e.target.files?.[0]?.name ?? "",
                  })
                }
                className="[display:none]"
              />
            </label>
          ) : (
            <input
              value={r.val}
              onChange={(e) => update(r.id, { val: e.target.value })}
              placeholder={valPlaceholder}
              style={inputStyle}
              spellCheck={false}
              className="[flex:1] [min-width:0] [background:transparent] [border:none] [outline:none] [font-size:12px] [color:var(--text-1)] [padding:8px_10px]"
            />
          )}
          {allowFiles && (
            <button
              onClick={() =>
                update(r.id, {
                  type: r.type === "file" ? "text" : "file",
                  file: undefined,
                  val: "",
                })
              }
              style={{
                fontFamily: MONO,
              }}
              title="Toggle text / file"
              className="[background:none] [border:none] [cursor:pointer] [color:var(--text-4)] [font-size:10px] [padding:0_6px] [flex-shrink:0]"
            >
              {r.type === "file" ? "file" : "text"}
            </button>
          )}
          <button
            onClick={() => remove(r.id)}
            aria-label="Remove row"
            className="[background:none] [border:none] [cursor:pointer] [color:var(--text-4)] [padding:0_10px] [display:flex] [align-items:center] [flex-shrink:0] hover:[color:var(--red)]"
          >
            <X size={13} />
          </button>
        </div>
      ))}
      <button
        onClick={() => setRows([...rows, emptyRow()])}
        style={{
          fontFamily: SANS,
        }}
        className="[display:flex] [align-items:center] [gap:6px] [padding:8px_12px] [background:none] [border:none] [cursor:pointer] [color:var(--text-3)] [font-size:12px]"
      >
        <Plus size={12} />
        Add row
      </button>
    </div>
  )
}
const TAB_KINDS: {
  value: TestKind
  label: string
}[] = [
  { value: "status", label: "Status code equals" },
  { value: "time", label: "Response time < (ms)" },
  { value: "bodyContains", label: "Body contains" },
  { value: "jsonEquals", label: "JSON path equals" },
  { value: "headerExists", label: "Header exists / equals" },
]
/* ─── Main ─── */
export default function ApiDebugger() {
  const { theme } = useTheme()
  const monacoTheme = theme === "dark" ? "vs-dark" : "vs"
  const [tabs, setTabs] = useState<Tab[]>(() => {
    const saved = loadLS<Tab[]>(LS.tabs, [])
    return saved.length
      ? saved.map((t) => ({ ...t, loading: false }))
      : [newTab()]
  })
  const [activeTabId, setActiveTabId] = useState<string>(() => "")
  const [history, setHistory] = useState<HistoryItem[]>(() =>
    loadLS(LS.history, []),
  )
  const [collections, setCollections] = useState<Collection[]>(() =>
    loadLS(LS.collections, [
      { id: uid(), name: "My Collection", requests: [] },
    ]),
  )
  const [envs, setEnvs] = useState<Environment[]>(() =>
    loadLS(LS.envs, [
      { id: "no-env", name: "No Environment", vars: [] },
      {
        id: uid(),
        name: "Local",
        vars: [
          {
            id: uid(),
            key: "baseUrl",
            val: "https://jsonplaceholder.typicode.com",
            on: true,
            type: "text",
          },
          { id: uid(), key: "token", val: "", on: true, type: "text" },
        ],
      },
    ]),
  )
  const [activeEnvId, setActiveEnvId] = useState<string>(() =>
    loadLS(LS.activeEnv, "no-env"),
  )
  const [sidebarTab, setSidebarTab] = useState<"history" | "collections">(
    "history",
  )
  const [historyFilter, setHistoryFilter] = useState("")
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(
    null,
  )
  const [reqTab, setReqTab] =
    useState<"params" | "headers" | "auth" | "body" | "tests">("params")
  const [resTab, setResTab] =
    useState<"body" | "headers" | "cookies" | "tests">("body")
  const [bodyView, setBodyView] = useState<"pretty" | "raw" | "preview">(
    "pretty",
  )
  const [wrap, setWrap] = useState(true)
  const [envModalOpen, setEnvModalOpen] = useState(false)
  const [curlModalOpen, setCurlModalOpen] = useState(false)
  const [curlText, setCurlText] = useState("")
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const [saveName, setSaveName] = useState("")
  const [saveCollId, setSaveCollId] = useState("")
  const [expandedColls, setExpandedColls] = useState<Set<string>>(new Set())
  const abortRef = useRef<AbortController | null>(null)
  /* Ensure a valid active tab */
  useEffect(() => {
    if (!tabs.length) {
      const t = newTab()
      setTabs([t])
      setActiveTabId(t.id)
    } else if (!tabs.find((t) => t.id === activeTabId)) {
      setActiveTabId(tabs[0].id)
    }
  }, [tabs, activeTabId])
  /* Persist */
  useEffect(
    () =>
      saveLS(
        LS.tabs,
        tabs.map((t) => ({ ...t, req: sanitizeReq(t.req), loading: false })),
      ),
    [tabs],
  )
  useEffect(() => saveLS(LS.history, history.slice(0, 60)), [history])
  useEffect(() => saveLS(LS.collections, collections), [collections])
  useEffect(() => saveLS(LS.envs, envs), [envs])
  useEffect(() => saveLS(LS.activeEnv, activeEnvId), [activeEnvId])
  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0]
  const req = activeTab?.req ?? newReq()
  const patchReq = useCallback(
    (patch: Partial<ReqState>) => {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTab?.id
            ? {
                ...t,
                req: { ...t.req, ...patch },
                dirty: true,
                name: patch.url ? tabName({ ...t.req, ...patch }) : t.name,
              }
            : t,
        ),
      )
    },
    [activeTab?.id],
  )
  const patchTab = useCallback(
    (patch: Partial<Tab>) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTab?.id ? { ...t, ...patch } : t)),
      )
    },
    [activeTab?.id],
  )
  const envVars = useMemo(() => {
    const env = envs.find((e) => e.id === activeEnvId)
    const rec: Record<string, string> = {}
    env?.vars
      .filter((v) => v.on && v.key.trim())
      .forEach((v) => (rec[v.key] = v.val))
    return rec
  }, [envs, activeEnvId])
  const enabledParams = req.params.filter((p) => p.on && p.key.trim())
  const finalUrl = useMemo(() => {
    const base = resolveVars(req.url, envVars)
    const extra = [...enabledParams]
    if (req.authType === "apikey" && req.apiKeyIn === "query" && req.apiKeyName)
      extra.push({
        id: "ak",
        key: req.apiKeyName,
        val: resolveVars(req.apiKeyValue, envVars),
        on: true,
      })
    if (!extra.length) return base
    try {
      const u = new URL(base)
      extra.forEach((p) =>
        u.searchParams.set(
          resolveVars(p.key, envVars),
          resolveVars(p.val, envVars),
        ),
      )
      return u.toString()
    } catch {
      const qs = extra
        .map(
          (p) =>
            `${encodeURIComponent(resolveVars(p.key, envVars))}=${encodeURIComponent(resolveVars(p.val, envVars))}`,
        )
        .join("&")
      return base + (base.includes("?") ? "&" : "?") + qs
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    req.url,
    req.params,
    req.authType,
    req.apiKeyIn,
    req.apiKeyName,
    req.apiKeyValue,
    envVars,
  ])
  const hasBody = req.bodyType !== "none" && METHODS_WITH_BODY.has(req.method)
  function buildHeaders(): Record<string, string> {
    const hdrs: Record<string, string> = {}
    req.headers
      .filter((h) => h.on && h.key.trim())
      .forEach(
        (h) =>
          (hdrs[resolveVars(h.key, envVars)] = resolveVars(h.val, envVars)),
      )
    if (req.authType === "bearer" && req.bearer.trim())
      hdrs["Authorization"] =
        `Bearer ${resolveVars(req.bearer, envVars).trim()}`
    if (req.authType === "basic")
      hdrs["Authorization"] =
        `Basic ${btoa(`${resolveVars(req.basicUser, envVars)}:${resolveVars(req.basicPass, envVars)}`)}`
    if (
      req.authType === "apikey" &&
      req.apiKeyIn === "header" &&
      req.apiKeyName.trim()
    )
      hdrs[req.apiKeyName] = resolveVars(req.apiKeyValue, envVars)
    if (
      hasBody &&
      (req.bodyType === "raw" || req.bodyType === "graphql") &&
      !hdrs["Content-Type"]
    )
      hdrs["Content-Type"] =
        req.bodyType === "graphql"
          ? "application/json"
          : rawContentType(req.rawLang)
    if (hasBody && req.bodyType === "urlencoded" && !hdrs["Content-Type"])
      hdrs["Content-Type"] = "application/x-www-form-urlencoded"
    return hdrs
  }
  function buildBody(): {
    body: BodyInit | undefined
    preview: string | undefined
  } {
    if (!hasBody) return { body: undefined, preview: undefined }
    if (req.bodyType === "raw") {
      const b = resolveVars(req.rawBody, envVars)
      return { body: b, preview: b }
    }
    if (req.bodyType === "graphql") {
      const b = JSON.stringify({
        query: resolveVars(req.graphqlQuery, envVars),
        variables: safeJson(resolveVars(req.graphqlVars, envVars)),
      })
      return { body: b, preview: b }
    }
    if (req.bodyType === "urlencoded") {
      const usp = new URLSearchParams()
      req.urlencoded
        .filter((r) => r.on && r.key.trim())
        .forEach((r) =>
          usp.append(resolveVars(r.key, envVars), resolveVars(r.val, envVars)),
        )
      return { body: usp.toString(), preview: usp.toString() }
    }
    // form-data
    const fd = new FormData()
    req.formData
      .filter((r) => r.on && r.key.trim())
      .forEach((r) => {
        if (r.type === "file" && r.file) fd.append(r.key, r.file)
        else fd.append(resolveVars(r.key, envVars), resolveVars(r.val, envVars))
      })
    return { body: fd, preview: "[multipart/form-data]" }
  }
  function runTests(res: Omit<ApiResponse, "tests">): TestResult[] {
    const results: TestResult[] = []
    let parsed: unknown
    for (const t of req.tests.filter((t) => t.on)) {
      try {
        if (t.kind === "status") {
          const exp = Number(t.value)
          results.push({
            name: `Status is ${exp}`,
            passed: res.status === exp,
            detail: `got ${res.status}`,
          })
        } else if (t.kind === "time") {
          const exp = Number(t.value)
          results.push({
            name: `Response < ${exp}ms`,
            passed: res.timeMs < exp,
            detail: `${Math.round(res.timeMs)}ms`,
          })
        } else if (t.kind === "bodyContains") {
          results.push({
            name: `Body contains "${t.value}"`,
            passed: res.body.includes(t.value),
            detail: res.body.includes(t.value) ? "found" : "not found",
          })
        } else if (t.kind === "headerExists") {
          const found = res.headers.find(
            ([k]) => k.toLowerCase() === t.target.toLowerCase(),
          )
          const passed = t.value ? found?.[1] === t.value : !!found
          results.push({
            name: t.value
              ? `${t.target} = ${t.value}`
              : `Header ${t.target} exists`,
            passed,
            detail: found ? found[1] : "absent",
          })
        } else if (t.kind === "jsonEquals") {
          if (parsed === undefined) parsed = safeJson(res.body)
          const actual = jsonPath(parsed, t.target)
          const passed = String(actual) === t.value
          results.push({
            name: `${t.target} = ${t.value}`,
            passed,
            detail: `got ${JSON.stringify(actual)}`,
          })
        }
      } catch (e) {
        results.push({ name: t.kind, passed: false, detail: String(e) })
      }
    }
    return results
  }
  const pushHistory = useCallback(
    (item: HistoryItem) => setHistory((h) => [item, ...h].slice(0, 60)),
    [],
  )
  const send = useCallback(async () => {
    if (!req.url.trim() || activeTab?.loading) return
    patchTab({ loading: true, response: null })
    setResTab("body")
    setBodyView("pretty")
    const controller = new AbortController()
    abortRef.current = controller
    const headers = buildHeaders()
    const { body } = buildBody()
    // Let the browser set the multipart boundary for FormData.
    if (body instanceof FormData) delete headers["Content-Type"]
    const started = performance.now()
    try {
      const res = await fetch(finalUrl, {
        method: req.method,
        headers,
        body,
        signal: controller.signal,
      })
      const blob = await res.blob()
      const text = await blob.text()
      const timeMs = performance.now() - started
      const ct = res.headers.get("content-type") ?? ""
      const isJson = ct.includes("json") || /^\s*[[{]/.test(text)
      const isHtml = ct.includes("html")
      const isImage = ct.startsWith("image/")
      let pretty = text
      if (isJson) {
        try {
          pretty = JSON.stringify(JSON.parse(text), null, 2)
        } catch {
          /* keep raw */
        }
      }
      const resHeaders: [string, string][] = []
      res.headers.forEach((v, k) => resHeaders.push([k, v]))
      const base = {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        timeMs,
        sizeBytes: blob.size,
        contentType: ct,
        headers: resHeaders,
        body: pretty,
        blobUrl: URL.createObjectURL(blob),
        isJson,
        isHtml,
        isImage,
      }
      const tests = runTests(base)
      patchTab({ loading: false, response: { ...base, tests } })
      pushHistory({
        id: uid(),
        method: req.method,
        url: finalUrl,
        status: res.status,
        ok: res.ok,
        timeMs,
        ts: Date.now(),
      })
    } catch (err) {
      const timeMs = performance.now() - started
      const aborted = controller.signal.aborted
      const message = aborted
        ? "Request cancelled"
        : err instanceof Error
          ? err.message
          : "Request failed"
      patchTab({
        loading: false,
        response: {
          status: 0,
          statusText: aborted ? "Aborted" : "Network / CORS error",
          ok: false,
          timeMs,
          sizeBytes: 0,
          contentType: "",
          headers: [],
          body:
            `${message}\n\n` +
            (aborted
              ? ""
              : "Usually a CORS restriction (target API sent no Access-Control-Allow-Origin " +
                "for this origin) or the host is unreachable. Try a CORS-friendly API such as " +
                "https://jsonplaceholder.typicode.com or https://httpbin.org."),
          blobUrl: "",
          isJson: false,
          isHtml: false,
          isImage: false,
          error: message,
          tests: [],
        },
      })
      if (!aborted)
        pushHistory({
          id: uid(),
          method: req.method,
          url: finalUrl,
          status: null,
          ok: false,
          timeMs,
          ts: Date.now(),
          error: true,
        })
    } finally {
      abortRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [req, finalUrl, activeTab?.loading, patchTab, pushHistory])
  const cancel = () => abortRef.current?.abort()
  /* Tab management */
  const addTab = () => {
    const t = newTab()
    setTabs((p) => [...p, t])
    setActiveTabId(t.id)
  }
  const closeTab = (id: string) => {
    setTabs((p) => {
      const next = p.filter((t) => t.id !== id)
      if (id === activeTabId && next.length)
        setActiveTabId(next[next.length - 1].id)
      return next.length ? next : [newTab()]
    })
  }
  const openRequest = (r: ReqState) => {
    const t = newTab(structuredClone(r))
    setTabs((p) => [...p, t])
    setActiveTabId(t.id)
  }
  const doSave = () => {
    if (!saveName.trim() || !saveCollId) return
    setCollections((cs) =>
      cs.map((c) =>
        c.id === saveCollId
          ? {
              ...c,
              requests: [
                ...c.requests,
                { id: uid(), name: saveName.trim(), req: sanitizeReq(req) },
              ],
            }
          : c,
      ),
    )
    patchTab({ dirty: false, name: saveName.trim() })
    setSaveModalOpen(false)
    setSaveName("")
    setSidebarTab("collections")
    setExpandedColls((s) => new Set(s).add(saveCollId))
  }
  const importCurl = () => {
    const parsed = parseCurl(curlText)
    if (parsed) {
      const t = newTab(newReq(parsed))
      setTabs((p) => [...p, t])
      setActiveTabId(t.id)
      setCurlModalOpen(false)
      setCurlText("")
    }
  }
  const copyCurl = () => {
    const { preview } = buildBody()
    const curl = buildCurl(
      req,
      finalUrl,
      buildHeaders(),
      preview === "[multipart/form-data]" ? undefined : preview,
    )
    navigator.clipboard?.writeText(curl).catch(() => {})
  }
  const filteredHistory = historyFilter
    ? history.filter(
        (h) =>
          h.url.toLowerCase().includes(historyFilter.toLowerCase()) ||
          h.method.toLowerCase().includes(historyFilter.toLowerCase()),
      )
    : history
  const formatRaw = () => {
    if (req.rawLang !== "json") return
    try {
      patchReq({ rawBody: JSON.stringify(JSON.parse(req.rawBody), null, 2) })
    } catch {
      /* leave */
    }
  }
  const response = activeTab?.response ?? null
  const loading = activeTab?.loading ?? false
  const reqTabs: {
    id: typeof reqTab
    label: string
    count?: number
  }[] = [
    { id: "params", label: "Params", count: enabledParams.length || undefined },
    {
      id: "headers",
      label: "Headers",
      count:
        req.headers.filter((h) => h.on && h.key.trim()).length || undefined,
    },
    { id: "auth", label: "Auth" },
    { id: "body", label: "Body" },
    { id: "tests", label: "Tests", count: req.tests.length || undefined },
  ]
  const tabBtn = (
    active: boolean,
    onClick: () => void,
    label: React.ReactNode,
    key?: React.Key,
  ) => (
    <button
      key={key}
      onClick={onClick}
      style={{
        fontFamily: SANS,
      }}
      className={[
        "[padding:0_14px] [height:36px] [font-size:12px] [font-weight:500] [background:transparent] [border:none] [cursor:pointer] [transition:color_0.12s] [white-space:nowrap]",
        active ? "[color:var(--text-1)]" : "[color:var(--text-4)]",
        active
          ? "[border-bottom:2px_solid_var(--text-1)]"
          : "[border-bottom:2px_solid_transparent]",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </button>
  )
  const countBadge = (n: number) => (
    <span
      style={{
        fontFamily: MONO,
      }}
      className="[font-size:9px] [font-weight:700] [padding:0_4px] [border-radius:4px] [background:var(--bg-3)] [color:var(--text-3)] [border:1px_solid_var(--border)]"
    >
      {n}
    </span>
  )
  const passCount = response?.tests.filter((t) => t.passed).length ?? 0
  return (
    <div
      style={{
        fontFamily: SANS,
      }}
      className="[display:flex] [flex-direction:column] [height:100%] [overflow:hidden] [background:var(--bg)]"
    >
      {/* Page header */}
      <div className="max-[700px]:flex-col max-[700px]:items-start max-[700px]:[&>button]:self-start max-[640px]:px-4 max-[640px]:gap-3 [padding:18px_32px_14px] [border-bottom:1px_solid_var(--border)] [flex-shrink:0] [display:flex] [align-items:center] [justify-content:space-between] [gap:12px] [flex-wrap:wrap]">
        <div>
          <h1 className="[font-size:18px] [font-weight:600] [letter-spacing:-0.02em] [color:var(--text-1)] [margin:0_0_3px]">
            API Debugger
          </h1>
          <p className="[font-size:13px] [color:var(--text-3)] [margin:0]">
            A full HTTP client — send live requests, script tests, manage
            environments
          </p>
        </div>
        <div className="[display:flex] [align-items:center] [gap:8px] [flex-wrap:wrap]">
          <div className="[display:flex] [align-items:center] [gap:6px]">
            <Globe size={13} className="[color:var(--text-4)]" />
            <SherlockSelect
              value={activeEnvId}
              onChange={setActiveEnvId}
              options={envs.map((e) => ({ value: e.id, label: e.name }))}
              minWidth={150}
              align="end"
            />
          </div>
          <IconBtn
            onClick={() => setEnvModalOpen(true)}
            title="Manage environments"
          >
            Environments
          </IconBtn>
          <IconBtn
            onClick={() => setCurlModalOpen(true)}
            title="Import from cURL"
          >
            <Download size={12} />
            Import
          </IconBtn>
        </div>
      </div>

      {/* Body: sidebar + main */}
      <div className="max-[800px]:flex-col [flex:1] [display:flex] [overflow:hidden] [min-height:0]">
        {/* Sidebar */}
        <div className="max-[800px]:w-full max-[800px]:max-h-[180px] max-[800px]:border-r-0 max-[800px]:border-b max-[800px]:border-[var(--border)] [width:260px] [flex-shrink:0] [border-right:1px_solid_var(--border)] [display:flex] [flex-direction:column] [overflow:hidden]">
          {/* Sidebar tab switch */}
          <div className="[display:flex] [border-bottom:1px_solid_var(--border)] [flex-shrink:0]">
            <button
              onClick={() => setSidebarTab("history")}
              style={sidebarTabStyle(sidebarTab === "history")}
            >
              <HistoryIcon size={12} /> History
            </button>
            <button
              onClick={() => setSidebarTab("collections")}
              style={sidebarTabStyle(sidebarTab === "collections")}
            >
              <FolderOpen size={12} /> Saved
            </button>
          </div>

          {sidebarTab === "history" && (
            <>
              <div className="[padding:8px_12px] [border-bottom:1px_solid_var(--border)] [flex-shrink:0] [display:flex] [gap:8px] [align-items:center]">
                <div className="[display:flex] [align-items:center] [gap:8px] [padding:6px_10px] [border-radius:6px] [border:1px_solid_var(--border)] [background:var(--bg-2)] [flex:1]">
                  <Search
                    size={12}
                    className="[color:var(--text-4)] [flex-shrink:0]"
                  />
                  <input
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value)}
                    placeholder="Filter..."
                    style={{
                      fontFamily: SANS,
                    }}
                    className="[flex:1] [min-width:0] [background:transparent] [border:none] [outline:none] [font-size:12px] [color:var(--text-1)]"
                  />
                </div>
                {history.length > 0 && (
                  <button
                    onClick={() => {
                      setHistory([])
                      setSelectedHistoryId(null)
                    }}
                    title="Clear history"
                    className="[background:none] [border:none] [cursor:pointer] [color:var(--text-4)] [display:flex]"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <div className="[flex:1] [overflow-y:auto]">
                {filteredHistory.length === 0 ? (
                  <div className="[padding:20px_16px] [text-align:center] [font-size:12px] [color:var(--text-4)] [line-height:1.6]">
                    No requests yet.
                    <div className="[margin-top:12px] [text-align:left]">
                      <p
                        style={{
                          fontFamily: MONO,
                        }}
                        className="[font-size:10px] [text-transform:uppercase] [letter-spacing:0.05em] [color:var(--text-4)] [margin:0_0_6px]"
                      >
                        Try a sample
                      </p>
                      {SAMPLE_URLS.map((s) => (
                        <button
                          key={s.url}
                          onClick={() =>
                            patchReq({
                              url: s.url,
                              method: s.method,
                              bodyType:
                                s.method === "POST" ? "raw" : req.bodyType,
                            })
                          }
                          className="[display:block] [width:100%] [text-align:left] [padding:6px_8px] [margin-bottom:2px] [border-radius:5px] [border:1px_solid_var(--border)] [background:var(--bg-2)] [color:var(--text-2)] [font-size:11px] [cursor:pointer]"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  filteredHistory.map((h) => (
                    <button
                      key={h.id}
                      aria-current={
                        selectedHistoryId === h.id ? "true" : undefined
                      }
                      onClick={() => {
                        setSelectedHistoryId(h.id)
                        patchReq({
                          method: h.method,
                          ...requestStateFromUrl(h.url),
                        })
                      }}
                      className={[
                        "[width:100%] [display:flex] [flex-direction:column] [gap:5px] [padding:8px_12px] [text-align:left] [cursor:pointer] [border:none] [border-bottom:1px_solid_var(--border)] [border-left:2px_solid_transparent] [transition:background_0.12s,border-color_0.12s]",
                        selectedHistoryId === h.id
                          ? "[background:var(--accent-bg)] [border-left-color:var(--accent)]"
                          : "[background:transparent] hover:[background:var(--bg-2)]",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <div className="[display:flex] [align-items:center] [gap:6px]">
                        <MethodTag method={h.method} />
                        <span
                          style={{
                            fontFamily: MONO,
                          }}
                          className="[font-size:11px] [color:var(--text-2)] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap] [flex:1]"
                        >
                          {h.url.replace(/^https?:\/\//, "")}
                        </span>
                      </div>
                      <div className="[display:flex] [align-items:center] [gap:8px]">
                        <span
                          style={{
                            fontFamily: MONO,
                            color: h.status
                              ? statusColor(h.status)
                              : "var(--red)",
                          }}
                          className="[font-size:10px] [font-weight:700]"
                        >
                          {h.error ? "ERR" : h.status}
                        </span>
                        <span
                          style={{
                            fontFamily: MONO,
                          }}
                          className="[font-size:10px] [color:var(--text-4)]"
                        >
                          {fmtMs(h.timeMs)}
                        </span>
                        <span
                          style={{
                            fontFamily: MONO,
                          }}
                          className="[font-size:10px] [color:var(--text-4)] [margin-left:auto]"
                        >
                          {relTime(h.ts)}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}

          {sidebarTab === "collections" && (
            <div className="[flex:1] [overflow-y:auto] [padding:8px]">
              {collections.map((c) => {
                const open = expandedColls.has(c.id)
                return (
                  <div key={c.id} className="[margin-bottom:4px]">
                    <button
                      onClick={() =>
                        setExpandedColls((s) => {
                          const n = new Set(s)
                          n.has(c.id) ? n.delete(c.id) : n.add(c.id)
                          return n
                        })
                      }
                      className="[display:flex] [align-items:center] [gap:6px] [width:100%] [padding:6px_8px] [border-radius:6px] [background:transparent] [border:none] [cursor:pointer] [color:var(--text-2)] [font-size:12px] [font-weight:500]"
                    >
                      {open ? (
                        <ChevronDown size={12} />
                      ) : (
                        <ChevronRight size={12} />
                      )}
                      <FolderOpen size={12} className="[color:var(--text-4)]" />
                      <span className="[flex:1] [text-align:left]">
                        {c.name}
                      </span>
                      {countBadge(c.requests.length)}
                    </button>
                    {open &&
                      c.requests.map((r) => (
                        <div
                          key={r.id}
                          className="[display:flex] [align-items:center] [gap:6px] [padding:5px_8px_5px_26px] [border-radius:6px] hover:[background:var(--bg-2)]"
                        >
                          <button
                            onClick={() => openRequest(r.req)}
                            className="[display:flex] [align-items:center] [gap:6px] [flex:1] [background:none] [border:none] [cursor:pointer] [text-align:left] [min-width:0]"
                          >
                            <MethodTag method={r.req.method} size={9} />
                            <span className="[font-size:11px] [color:var(--text-2)] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]">
                              {r.name}
                            </span>
                          </button>
                          <button
                            onClick={() =>
                              setCollections((cs) =>
                                cs.map((cc) =>
                                  cc.id === c.id
                                    ? {
                                        ...cc,
                                        requests: cc.requests.filter(
                                          (rr) => rr.id !== r.id,
                                        ),
                                      }
                                    : cc,
                                ),
                              )
                            }
                            title="Delete"
                            className="[background:none] [border:none] [cursor:pointer] [color:var(--text-4)] [display:flex]"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                    {open && c.requests.length === 0 && (
                      <p className="[padding:4px_8px_8px_26px] [font-size:11px] [color:var(--text-4)] [margin:0]">
                        Empty — save a request here.
                      </p>
                    )}
                  </div>
                )
              })}
              <button
                onClick={() =>
                  setCollections((cs) => [
                    ...cs,
                    {
                      id: uid(),
                      name: `Collection ${cs.length + 1}`,
                      requests: [],
                    },
                  ])
                }
                className="[display:flex] [align-items:center] [gap:6px] [padding:8px] [background:none] [border:none] [cursor:pointer] [color:var(--text-3)] [font-size:12px] [width:100%]"
              >
                <Plus size={12} /> New collection
              </button>
            </div>
          )}
        </div>

        {/* Main panel */}
        <div className="max-[800px]:min-h-0 max-[800px]:flex-1 [flex:1] [display:flex] [flex-direction:column] [overflow:hidden] [min-width:0]">
          {/* Request tabs bar */}
          <div className="[display:flex] [align-items:center] [border-bottom:1px_solid_var(--border)] [flex-shrink:0] [background:var(--bg)] [overflow-x:auto]">
            {tabs.map((t) => (
              <div
                key={t.id}
                onClick={() => setActiveTabId(t.id)}
                className={[
                  "[display:flex] [align-items:center] [gap:6px] [padding:0_10px] [height:36px] [cursor:pointer] [border-right:1px_solid_var(--border)] [flex-shrink:0] [max-width:180px]",
                  t.id === activeTabId
                    ? "[background:var(--bg-2)]"
                    : "[background:transparent]",
                  t.id === activeTabId
                    ? "[border-bottom:2px_solid_var(--accent)]"
                    : "[border-bottom:2px_solid_transparent]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <MethodTag method={t.req.method} size={9} />
                <span
                  className={[
                    "[font-size:12px] [overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]",
                    t.id === activeTabId
                      ? "[color:var(--text-1)]"
                      : "[color:var(--text-3)]",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {t.name}
                  {t.dirty && <span className="[color:var(--yellow)]"> •</span>}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(t.id)
                  }}
                  className="[background:none] [border:none] [cursor:pointer] [color:var(--text-4)] [display:flex] [padding:2px] [flex-shrink:0]"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
            <button
              onClick={addTab}
              title="New request tab"
              className="[background:none] [border:none] [cursor:pointer] [color:var(--text-3)] [padding:0_12px] [height:36px] [display:flex] [align-items:center] [flex-shrink:0]"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Request bar */}
          <div className="max-[800px]:px-3.5 max-[800px]:py-2.5 max-[480px]:px-3 max-[480px]:[&>input]:-order-1 max-[480px]:[&>input]:basis-full [padding:12px_20px] [border-bottom:1px_solid_var(--border)] [flex-shrink:0] [display:flex] [align-items:center] [gap:8px] [flex-wrap:wrap] [background:var(--bg)]">
            <div className="[flex-shrink:0]">
              <SherlockSelect
                value={req.method}
                onChange={(v) => patchReq({ method: v })}
                options={METHODS}
                minWidth={104}
              />
            </div>
            <input
              value={finalUrl}
              onChange={(e) => patchReq(requestStateFromUrl(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") send()
              }}
              placeholder="https://api.example.com/endpoint  (supports {{variables}})"
              spellCheck={false}
              style={{
                fontFamily: MONO,
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "var(--accent)")
              }
              onBlur={(e) =>
                (e.currentTarget.style.borderColor = "var(--border)")
              }
              className="[flex:1] [min-width:180px] [height:34px] [padding:0_12px] [border-radius:7px] [border:1px_solid_var(--border)] [background:var(--bg-2)] [color:var(--text-1)] [font-size:13px] [outline:none]"
            />
            {loading ? (
              <button
                onClick={cancel}
                style={sendBtnStyle(
                  "var(--red-bg)",
                  "var(--red)",
                  "var(--red-border)",
                )}
              >
                <X size={13} /> Cancel
              </button>
            ) : (
              <button
                onClick={send}
                style={sendBtnStyle("var(--accent)", "#fff", "var(--accent)")}
                className="hover:[opacity:0.88]"
              >
                <Send size={13} /> Send
              </button>
            )}
            <IconBtn
              onClick={() => {
                setSaveName(activeTab?.name ?? "")
                setSaveCollId(collections[0]?.id ?? "")
                setSaveModalOpen(true)
              }}
              title="Save request"
            >
              <Save size={12} /> Save
            </IconBtn>
            <IconBtn onClick={copyCurl} title="Copy as cURL">
              <TerminalSquare size={12} /> cURL
            </IconBtn>
          </div>

          {/* Request config tabs */}
          <div className="[display:flex] [border-bottom:1px_solid_var(--border)] [flex-shrink:0] [overflow-x:auto]">
            {reqTabs.map((t) =>
              tabBtn(
                reqTab === t.id,
                () => setReqTab(t.id),
                <span className="[display:inline-flex] [align-items:center] [gap:6px]">
                  {t.label}
                  {t.count != null && countBadge(t.count)}
                </span>,
                t.id,
              ),
            )}
          </div>

          {/* Request config content */}
          <div className="[flex-shrink:0] [max-height:40%] [overflow-y:auto] [border-bottom:1px_solid_var(--border)] [background:var(--bg)]">
            {reqTab === "params" && (
              <KVEditor
                rows={req.params}
                setRows={(r) => patchReq({ params: r })}
                keyPlaceholder="Parameter"
              />
            )}
            {reqTab === "headers" && (
              <KVEditor
                rows={req.headers}
                setRows={(r) => patchReq({ headers: r })}
                keyPlaceholder="Header"
              />
            )}
            {reqTab === "auth" && (
              <div className="[padding:16px] [display:flex] [flex-direction:column] [gap:14px]">
                <div className="[display:flex] [align-items:center] [gap:10px]">
                  <span className="[font-size:12px] [color:var(--text-3)]">
                    Type
                  </span>
                  <SherlockSelect
                    value={req.authType}
                    onChange={(v) => patchReq({ authType: v as AuthType })}
                    options={[
                      { value: "none", label: "No Auth" },
                      { value: "bearer", label: "Bearer Token" },
                      { value: "basic", label: "Basic Auth" },
                      { value: "apikey", label: "API Key" },
                    ]}
                    minWidth={150}
                  />
                </div>
                {req.authType === "bearer" && (
                  <input
                    value={req.bearer}
                    onChange={(e) => patchReq({ bearer: e.target.value })}
                    placeholder="Token"
                    spellCheck={false}
                    style={{
                      fontFamily: MONO,
                      fontFamily: MONO,
                    }}
                    className="[max-width:480px]"
                  />
                )}
                {req.authType === "basic" && (
                  <div className="[display:flex] [gap:8px] [flex-wrap:wrap]">
                    <input
                      value={req.basicUser}
                      onChange={(e) => patchReq({ basicUser: e.target.value })}
                      placeholder="Username"
                      spellCheck={false}
                      style={{
                        fontFamily: MONO,
                        fontFamily: MONO,
                      }}
                      className="[max-width:236px]"
                    />
                    <input
                      value={req.basicPass}
                      onChange={(e) => patchReq({ basicPass: e.target.value })}
                      placeholder="Password"
                      type="password"
                      style={{
                        fontFamily: MONO,
                        fontFamily: MONO,
                      }}
                      className="[max-width:236px]"
                    />
                  </div>
                )}
                {req.authType === "apikey" && (
                  <div className="[display:flex] [gap:8px] [flex-wrap:wrap] [align-items:center]">
                    <input
                      value={req.apiKeyName}
                      onChange={(e) => patchReq({ apiKeyName: e.target.value })}
                      placeholder="Key"
                      spellCheck={false}
                      style={{
                        fontFamily: MONO,
                        fontFamily: MONO,
                      }}
                      className="[max-width:180px]"
                    />
                    <input
                      value={req.apiKeyValue}
                      onChange={(e) =>
                        patchReq({ apiKeyValue: e.target.value })
                      }
                      placeholder="Value"
                      spellCheck={false}
                      style={{
                        fontFamily: MONO,
                        fontFamily: MONO,
                      }}
                      className="[max-width:236px]"
                    />
                    <SherlockSelect
                      value={req.apiKeyIn}
                      onChange={(v) =>
                        patchReq({ apiKeyIn: v as "header" | "query" })
                      }
                      options={[
                        { value: "header", label: "Add to Header" },
                        { value: "query", label: "Add to Query" },
                      ]}
                      minWidth={150}
                    />
                  </div>
                )}
                {req.authType === "none" && (
                  <p className="[font-size:12px] [color:var(--text-4)] [margin:0]">
                    This request does not use authorization.
                  </p>
                )}
              </div>
            )}
            {reqTab === "body" && (
              <div>
                <div className="[display:flex] [align-items:center] [gap:10px] [padding:8px_12px] [border-bottom:1px_solid_var(--border)] [flex-wrap:wrap]">
                  <SherlockSelect
                    value={req.bodyType}
                    onChange={(v) => patchReq({ bodyType: v as BodyType })}
                    options={[
                      { value: "none", label: "None" },
                      { value: "raw", label: "Raw" },
                      { value: "form-data", label: "Form Data" },
                      { value: "urlencoded", label: "x-www-form-urlencoded" },
                      { value: "graphql", label: "GraphQL" },
                    ]}
                    minWidth={200}
                  />
                  {req.bodyType === "raw" && (
                    <>
                      <SherlockSelect
                        value={req.rawLang}
                        onChange={(v) => patchReq({ rawLang: v as RawLang })}
                        options={["json", "text", "xml", "html", "javascript"]}
                        minWidth={110}
                      />
                      {req.rawLang === "json" && (
                        <button
                          onClick={formatRaw}
                          className="[font-size:11px] [color:var(--text-3)] [background:none] [border:1px_solid_var(--border)] [border-radius:5px] [padding:3px_8px] [cursor:pointer]"
                        >
                          Format
                        </button>
                      )}
                    </>
                  )}
                  {!METHODS_WITH_BODY.has(req.method) && (
                    <span
                      style={{
                        fontFamily: MONO,
                      }}
                      className="[font-size:11px] [color:var(--yellow)]"
                    >
                      {req.method} usually has no body
                    </span>
                  )}
                </div>
                {req.bodyType === "none" && (
                  <p className="[padding:16px] [font-size:12px] [color:var(--text-4)] [margin:0]">
                    This request has no body.
                  </p>
                )}
                {req.bodyType === "raw" && (
                  <div className="[height:200px]">
                    <Editor
                      height="200px"
                      language={req.rawLang}
                      theme={monacoTheme}
                      value={req.rawBody}
                      onChange={(v) => patchReq({ rawBody: v ?? "" })}
                      options={editorOpts}
                    />
                  </div>
                )}
                {req.bodyType === "form-data" && (
                  <KVEditor
                    rows={req.formData}
                    setRows={(r) => patchReq({ formData: r })}
                    keyPlaceholder="Field"
                    allowFiles
                  />
                )}
                {req.bodyType === "urlencoded" && (
                  <KVEditor
                    rows={req.urlencoded}
                    setRows={(r) => patchReq({ urlencoded: r })}
                    keyPlaceholder="Field"
                  />
                )}
                {req.bodyType === "graphql" && (
                  <div>
                    <div
                      style={{
                        fontFamily: MONO,
                      }}
                      className="[padding:6px_12px] [font-size:10px] [color:var(--text-4)] [text-transform:uppercase] [letter-spacing:0.05em]"
                    >
                      Query
                    </div>
                    <div className="[height:150px]">
                      <Editor
                        height="150px"
                        language="graphql"
                        theme={monacoTheme}
                        value={req.graphqlQuery}
                        onChange={(v) => patchReq({ graphqlQuery: v ?? "" })}
                        options={editorOpts}
                      />
                    </div>
                    <div
                      style={{
                        fontFamily: MONO,
                      }}
                      className="[padding:6px_12px] [font-size:10px] [color:var(--text-4)] [text-transform:uppercase] [letter-spacing:0.05em] [border-top:1px_solid_var(--border)]"
                    >
                      Variables (JSON)
                    </div>
                    <div className="[height:90px]">
                      <Editor
                        height="90px"
                        language="json"
                        theme={monacoTheme}
                        value={req.graphqlVars}
                        onChange={(v) => patchReq({ graphqlVars: v ?? "" })}
                        options={editorOpts}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            {reqTab === "tests" && (
              <TestsEditor
                rows={req.tests}
                setRows={(r) => patchReq({ tests: r })}
              />
            )}
          </div>

          {/* Response area */}
          <div className="[flex:1] [display:flex] [flex-direction:column] [min-height:0]">
            <div className="[display:flex] [align-items:center] [gap:14px] [padding:0_20px] [min-height:40px] [border-bottom:1px_solid_var(--border)] [flex-shrink:0] [background:var(--bg)] [flex-wrap:wrap]">
              {!response && !loading && (
                <span className="[font-size:12px] [color:var(--text-4)]">
                  Send a request to see the response
                </span>
              )}
              {loading && (
                <span className="[display:flex] [align-items:center] [gap:8px] [font-size:12px] [color:var(--text-3)]">
                  <Loader2
                    size={13}
                    className="[animation:conic-spin_0.8s_linear_infinite]"
                  />{" "}
                  Sending request…
                </span>
              )}
              {response && !loading && (
                <>
                  <span
                    style={{
                      fontFamily: MONO,
                      color: statusColor(response.status),
                    }}
                    className="[display:flex] [align-items:center] [gap:6px] [font-size:12px] [font-weight:700]"
                  >
                    <span
                      style={{
                        background: statusColor(response.status),
                      }}
                      className="[width:7px] [height:7px] [border-radius:50%] [display:block]"
                    />
                    {response.status === 0
                      ? response.statusText
                      : `${response.status} ${response.statusText}`}
                  </span>
                  <span
                    style={{
                      fontFamily: MONO,
                    }}
                    className="[font-size:12px] [color:var(--text-3)]"
                  >
                    {fmtMs(response.timeMs)}
                  </span>
                  <span
                    style={{
                      fontFamily: MONO,
                    }}
                    className="[font-size:12px] [color:var(--text-3)]"
                  >
                    {fmtBytes(response.sizeBytes)}
                  </span>
                  {response.tests.length > 0 && (
                    <span
                      style={{
                        fontFamily: MONO,
                      }}
                      className={[
                        "[font-size:11px] [font-weight:600]",
                        passCount === response.tests.length
                          ? "[color:var(--green)]"
                          : "[color:var(--red)]",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      Tests {passCount}/{response.tests.length}
                    </span>
                  )}
                  <div className="[margin-left:auto] [display:flex] [align-items:center] [gap:8px]">
                    {resTab === "body" && (
                      <button
                        onClick={() => setWrap((w) => !w)}
                        title="Toggle word wrap"
                        style={{
                          fontFamily: MONO,
                        }}
                        className={[
                          "[display:flex] [align-items:center] [gap:4px] [padding:3px_8px] [border-radius:5px] [border:1px_solid_var(--border)] [cursor:pointer] [font-size:10px] [color:var(--text-3)]",
                          wrap
                            ? "[background:var(--bg-3)]"
                            : "[background:transparent]",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <WrapText size={11} /> Wrap
                      </button>
                    )}
                    <CopyBtn value={response.body} />
                  </div>
                </>
              )}
            </div>

            {response && !loading && (
              <div className="[display:flex] [border-bottom:1px_solid_var(--border)] [flex-shrink:0] [align-items:center]">
                {tabBtn(resTab === "body", () => setResTab("body"), "Body")}
                {tabBtn(
                  resTab === "headers",
                  () => setResTab("headers"),
                  <span className="[display:inline-flex] [align-items:center] [gap:6px]">
                    Headers {countBadge(response.headers.length)}
                  </span>,
                )}
                {tabBtn(
                  resTab === "cookies",
                  () => setResTab("cookies"),
                  "Cookies",
                )}
                {tabBtn(
                  resTab === "tests",
                  () => setResTab("tests"),
                  <span className="[display:inline-flex] [align-items:center] [gap:6px]">
                    Tests{" "}
                    {response.tests.length > 0 &&
                      countBadge(response.tests.length)}
                  </span>,
                )}
                {resTab === "body" && !response.error && (
                  <div className="[margin-left:auto] [display:flex] [gap:2px] [padding:0_8px]">
                    {(["pretty", "raw", "preview"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setBodyView(m)}
                        style={{
                          fontFamily: SANS,
                        }}
                        className={[
                          "[font-size:11px] [padding:3px_8px] [border-radius:5px] [border:none] [cursor:pointer] [text-transform:capitalize]",
                          bodyView === m
                            ? "[background:var(--bg-3)]"
                            : "[background:transparent]",
                          bodyView === m
                            ? "[color:var(--text-1)]"
                            : "[color:var(--text-4)]",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Response content */}
            <div className="[flex:1] [min-height:0] [overflow:hidden] [background:var(--bg)]">
              {response && !loading && resTab === "body" && (
                <>
                  {response.error && (
                    <div
                      style={errorBodyStyle}
                      className="[padding:16px_20px] [font-size:12px] [line-height:1.7] [color:var(--text-2)] [white-space:pre-wrap] [overflow-y:auto] [height:100%] [box-sizing:border-box]"
                    >
                      {response.body}
                    </div>
                  )}
                  {!response.error && bodyView === "raw" && (
                    <pre
                      style={{
                        fontFamily: MONO,
                      }}
                      className={[
                        "[margin:0] [padding:12px_20px] [font-size:12px] [line-height:1.7] [color:var(--text-2)] [overflow:auto] [height:100%] [box-sizing:border-box]",
                        wrap ? "[white-space:pre-wrap]" : "[white-space:pre]",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {response.body}
                    </pre>
                  )}
                  {!response.error &&
                    bodyView === "preview" &&
                    (response.isImage && response.blobUrl ? (
                      <div className="[height:100%] [overflow:auto] [display:flex] [align-items:center] [justify-content:center] [padding:16px]">
                        <img
                          src={response.blobUrl}
                          alt="response"
                          className="[max-width:100%] [max-height:100%]"
                        />
                      </div>
                    ) : response.isHtml ? (
                      <iframe
                        title="preview"
                        srcDoc={response.body}
                        sandbox=""
                        className="[width:100%] [height:100%] [border:none] [background:#fff]"
                      />
                    ) : (
                      <div className="[height:100%] [display:flex] [align-items:center] [justify-content:center] [color:var(--text-4)] [font-size:12px]">
                        No preview for{" "}
                        {response.contentType || "this content type"}
                      </div>
                    ))}
                  {!response.error && bodyView === "pretty" && (
                    <Editor
                      height="100%"
                      language={
                        response.isJson
                          ? "json"
                          : response.isHtml
                            ? "html"
                            : "plaintext"
                      }
                      theme={monacoTheme}
                      value={response.body}
                      options={{
                        ...editorOpts,
                        readOnly: true,
                        wordWrap: wrap ? "on" : "off",
                      }}
                    />
                  )}
                </>
              )}
              {response && !loading && resTab === "headers" && (
                <div className="[overflow-y:auto] [height:100%]">
                  {response.headers.map(([k, v], i) => (
                    <div
                      key={i}
                      className="[display:grid] [grid-template-columns:220px_1fr] [align-items:center] [padding:0_20px] [min-height:38px] [border-bottom:1px_solid_var(--border)]"
                    >
                      <span
                        style={{
                          fontFamily: MONO,
                        }}
                        className="[font-size:12px] [color:var(--text-2)]"
                      >
                        {k}
                      </span>
                      <span
                        style={{
                          fontFamily: MONO,
                        }}
                        className="[font-size:12px] [color:var(--text-3)] [word-break:break-all] [padding:8px_0]"
                      >
                        {v}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {response && !loading && resTab === "cookies" && (
                <div className="[padding:20px]">
                  {(() => {
                    const setCookie = response.headers.filter(
                      ([k]) => k.toLowerCase() === "set-cookie",
                    )
                    if (!setCookie.length)
                      return (
                        <p className="[font-size:12px] [color:var(--text-4)] [margin:0] [line-height:1.6]">
                          No cookies exposed. Browsers hide{" "}
                          <code>Set-Cookie</code> from fetch for cross-origin
                          responses; cookies are still stored by the browser
                          when applicable.
                        </p>
                      )
                    return setCookie.map(([, v], i) => (
                      <div
                        key={i}
                        style={{
                          fontFamily: MONO,
                        }}
                        className="[font-size:12px] [color:var(--text-2)] [padding:6px_0] [border-bottom:1px_solid_var(--border)]"
                      >
                        {v}
                      </div>
                    ))
                  })()}
                </div>
              )}
              {response && !loading && resTab === "tests" && (
                <div className="[overflow-y:auto] [height:100%]">
                  {response.tests.length === 0 ? (
                    <p className="[padding:20px] [font-size:12px] [color:var(--text-4)] [margin:0]">
                      No tests defined. Add assertions in the request "Tests"
                      tab; they run automatically after each response.
                    </p>
                  ) : (
                    response.tests.map((t, i) => (
                      <div
                        key={i}
                        className="[display:flex] [align-items:center] [gap:10px] [padding:10px_20px] [border-bottom:1px_solid_var(--border)]"
                      >
                        {t.passed ? (
                          <CheckCircle2
                            size={14}
                            className="[color:var(--green)]"
                          />
                        ) : (
                          <XCircle size={14} className="[color:var(--red)]" />
                        )}
                        <span className="[font-size:12px] [color:var(--text-1)] [flex:1]">
                          {t.name}
                        </span>
                        <span
                          style={{
                            fontFamily: MONO,
                          }}
                          className="[font-size:11px] [color:var(--text-4)]"
                        >
                          {t.detail}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              )}
              {!response && !loading && (
                <div className="[height:100%] [display:flex] [flex-direction:column] [align-items:center] [justify-content:center] [gap:10px] [color:var(--text-4)]">
                  <Send size={22} />
                  <span className="[font-size:13px]">No response yet</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Modals ─── */}
      {envModalOpen && (
        <Modal title="Environments" onClose={() => setEnvModalOpen(false)} wide>
          <EnvManager
            envs={envs}
            setEnvs={setEnvs}
            activeEnvId={activeEnvId}
            setActiveEnvId={setActiveEnvId}
          />
        </Modal>
      )}
      {curlModalOpen && (
        <Modal title="Import from cURL" onClose={() => setCurlModalOpen(false)}>
          <div className="[padding:16px] [display:flex] [flex-direction:column] [gap:12px]">
            <textarea
              value={curlText}
              onChange={(e) => setCurlText(e.target.value)}
              placeholder="curl -X POST 'https://api.example.com' -H 'Content-Type: application/json' --data '{...}'"
              style={{
                fontFamily: MONO,
                fontFamily: MONO,
              }}
              className="[min-height:160px] [font-size:12px]"
            />
            <div className="[display:flex] [justify-content:flex-end] [gap:8px]">
              <button
                className="h-8 rounded-md border border-[var(--border)] bg-transparent px-3.5 text-[13px] font-medium tracking-[-0.01em] text-[var(--text-2)] cursor-pointer transition-colors hover:border-[var(--border-2)] hover:bg-[var(--bg-3)]"
                onClick={() => setCurlModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="h-8 rounded-md border-0 bg-[var(--text-1)] px-3.5 text-[13px] font-medium tracking-[-0.01em] text-[var(--bg)] cursor-pointer transition-opacity hover:opacity-85"
                onClick={importCurl}
              >
                Import
              </button>
            </div>
          </div>
        </Modal>
      )}
      {saveModalOpen && (
        <Modal title="Save Request" onClose={() => setSaveModalOpen(false)}>
          <div className="[padding:16px] [display:flex] [flex-direction:column] [gap:14px]">
            <div className="flex flex-col gap-[5px] [&_label]:text-xs [&_label]:font-medium [&_label]:text-[var(--text-2)] [&_label]:tracking-[-0.004em]">
              <label>Request name</label>
              <input
                className="h-[34px] w-full box-border rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[13px] text-[var(--text-1)] tracking-[-0.004em] outline-none transition-colors focus:border-[var(--accent)]"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Get user"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-[5px] [&_label]:text-xs [&_label]:font-medium [&_label]:text-[var(--text-2)] [&_label]:tracking-[-0.004em]">
              <label>Collection</label>
              <SherlockSelect
                value={saveCollId}
                onChange={setSaveCollId}
                options={collections.map((c) => ({
                  value: c.id,
                  label: c.name,
                }))}
                minWidth="100%"
              />
            </div>
            <div className="[display:flex] [justify-content:flex-end] [gap:8px]">
              <button
                className="h-8 rounded-md border border-[var(--border)] bg-transparent px-3.5 text-[13px] font-medium tracking-[-0.01em] text-[var(--text-2)] cursor-pointer transition-colors hover:border-[var(--border-2)] hover:bg-[var(--bg-3)]"
                onClick={() => setSaveModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="h-8 rounded-md border-0 bg-[var(--text-1)] px-3.5 text-[13px] font-medium tracking-[-0.01em] text-[var(--bg)] cursor-pointer transition-opacity hover:opacity-85"
                onClick={doSave}
              >
                <Star
                  size={12}
                  className="[margin-right:4px] [display:inline]"
                />{" "}
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
/* ─── Sub-components & style helpers ─── */
const editorOpts = {
  minimap: { enabled: false },
  fontSize: 12,
  fontFamily: "Geist Mono, monospace",
  lineNumbers: "on" as const,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  padding: { top: 10, bottom: 10 },
}
function rawContentType(lang: RawLang) {
  return lang === "json"
    ? "application/json"
    : lang === "xml"
      ? "application/xml"
      : lang === "html"
        ? "text/html"
        : lang === "javascript"
          ? "application/javascript"
          : "text/plain"
}
function safeJson(s: string): unknown {
  try {
    return JSON.parse(s)
  } catch {
    return undefined
  }
}
function sidebarTabStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 38,
    fontSize: 12,
    fontWeight: 500,
    background: "transparent",
    border: "none",
    cursor: "pointer",
    color: active ? "var(--text-1)" : "var(--text-4)",
    borderBottom: active ? "2px solid var(--text-1)" : "2px solid transparent",
    fontFamily: SANS,
  }
}
const historyItemStyle: React.CSSProperties = {
  width: "100%",
  display: "flex",
  flexDirection: "column",
  gap: 5,
  padding: "8px 12px",
  textAlign: "left",
  cursor: "pointer",
  background: "transparent",
  border: "none",
  borderBottom: "1px solid var(--border)",
}
function sendBtnStyle(
  bg: string,
  color: string,
  border: string,
): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 6,
    height: 34,
    padding: "0 18px",
    borderRadius: 7,
    border: `1px solid ${border}`,
    background: bg,
    color,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: SANS,
    flexShrink: 0,
  }
}
const errorBodyStyle: React.CSSProperties = {
  padding: "16px 20px",
  fontFamily: MONO,
  fontSize: 12,
  lineHeight: 1.7,
  color: "var(--text-2)",
  whiteSpace: "pre-wrap",
  overflowY: "auto",
  height: "100%",
  boxSizing: "border-box",
}
function TestsEditor({
  rows,
  setRows,
}: {
  rows: TestRow[]
  setRows: (r: TestRow[]) => void
}) {
  const update = (id: string, patch: Partial<TestRow>) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const needsTarget = (k: TestKind) =>
    k === "jsonEquals" || k === "headerExists"
  return (
    <div className="[padding:12px]">
      <p className="[font-size:11px] [color:var(--text-4)] [margin:0_0_10px] [line-height:1.5]">
        Assertions run automatically after each response. Results appear in the
        response "Tests" tab.
      </p>
      {rows.map((r) => (
        <div
          key={r.id}
          className="[display:flex] [align-items:center] [gap:8px] [margin-bottom:8px] [flex-wrap:wrap]"
        >
          <input
            type="checkbox"
            checked={r.on}
            onChange={(e) => update(r.id, { on: e.target.checked })}
            className="[accent-color:var(--accent)]"
          />
          <SherlockSelect
            value={r.kind}
            onChange={(v) => update(r.id, { kind: v as TestKind })}
            options={TAB_KINDS.map((k) => ({ value: k.value, label: k.label }))}
            minWidth={190}
          />
          {needsTarget(r.kind) && (
            <input
              value={r.target}
              onChange={(e) => update(r.id, { target: e.target.value })}
              placeholder={
                r.kind === "jsonEquals" ? "path e.g. data.id" : "header name"
              }
              style={{
                fontFamily: MONO,
                fontFamily: MONO,
              }}
              className="[max-width:160px] [height:30px]"
            />
          )}
          <input
            value={r.value}
            onChange={(e) => update(r.id, { value: e.target.value })}
            placeholder="expected value"
            style={{
              fontFamily: MONO,
              fontFamily: MONO,
            }}
            className="[max-width:160px] [height:30px]"
          />
          <button
            onClick={() => setRows(rows.filter((x) => x.id !== r.id))}
            className="[background:none] [border:none] [cursor:pointer] [color:var(--text-4)] [display:flex]"
          >
            <X size={13} />
          </button>
        </div>
      ))}
      <button
        onClick={() =>
          setRows([
            ...rows,
            { id: uid(), kind: "status", target: "", value: "200", on: true },
          ])
        }
        className="[display:flex] [align-items:center] [gap:6px] [padding:6px_0] [background:none] [border:none] [cursor:pointer] [color:var(--text-3)] [font-size:12px]"
      >
        <Plus size={12} /> Add assertion
      </button>
    </div>
  )
}
function Modal({
  title,
  onClose,
  children,
  wide,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div
      className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-[2px] animate-[dialog-overlay-in_0.15s_ease] data-[state=closed]:animate-[dialog-overlay-out_0.15s_ease_forwards]"
      onClick={onClose}
    >
      <div
        className="fixed left-1/2 top-1/2 z-[201] w-[min(480px,calc(100vw-32px))] max-h-[calc(100vh-64px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--bg-2)] p-0 shadow-[0_24px_64px_rgba(0,0,0,0.24),0_4px_16px_rgba(0,0,0,0.12)] outline-none animate-[dialog-in_0.18s_cubic-bezier(0.4,0,0.2,1)] data-[state=closed]:animate-[dialog-out_0.15s_cubic-bezier(0.4,0,0.2,1)_forwards]"
        style={{ width: wide ? "min(720px, calc(100vw - 32px))" : undefined }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-1 px-5 pt-5">
          <h2 className="m-0 pr-7 text-[15px] font-semibold leading-normal tracking-[-0.015em] text-[var(--text-1)]">
            {title}
          </h2>
        </div>
        <button
          className="absolute right-3.5 top-3.5 flex size-6 cursor-pointer items-center justify-center rounded-[5px] border border-[var(--border)] bg-transparent text-[var(--text-4)] transition-colors hover:border-[var(--border-2)] hover:bg-[var(--bg-3)] hover:text-[var(--text-1)]"
          onClick={onClose}
        >
          <X size={13} />
        </button>
        {children}
      </div>
    </div>
  )
}
function EnvManager({
  envs,
  setEnvs,
  activeEnvId,
  setActiveEnvId,
}: {
  envs: Environment[]
  setEnvs: React.Dispatch<React.SetStateAction<Environment[]>>
  activeEnvId: string
  setActiveEnvId: (id: string) => void
}) {
  const [selId, setSelId] = useState(
    () => envs.find((e) => e.id !== "no-env")?.id ?? envs[0]?.id ?? "",
  )
  const sel = envs.find((e) => e.id === selId)
  const editable = sel && sel.id !== "no-env"
  const updateVars = (vars: KV[]) =>
    setEnvs((es) => es.map((e) => (e.id === selId ? { ...e, vars } : e)))
  return (
    <div className="[display:flex] [min-height:320px] [max-height:60vh]">
      <div className="[width:200px] [border-right:1px_solid_var(--border)] [overflow-y:auto] [flex-shrink:0]">
        {envs.map((e) => (
          <div key={e.id} className="[display:flex] [align-items:center]">
            <button
              onClick={() => setSelId(e.id)}
              className={[
                "[flex:1] [text-align:left] [padding:10px_12px] [border:none] [border-bottom:1px_solid_var(--border)] [cursor:pointer] [color:var(--text-2)] [font-size:12px] [display:flex] [align-items:center] [gap:6px] [min-width:0]",
                e.id === selId
                  ? "[background:var(--bg-3)]"
                  : "[background:transparent]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {e.id === activeEnvId && (
                <span className="[width:6px] [height:6px] [border-radius:50%] [background:var(--green)] [flex-shrink:0]" />
              )}
              <span className="[overflow:hidden] [text-overflow:ellipsis] [white-space:nowrap]">
                {e.name}
              </span>
            </button>
          </div>
        ))}
        <button
          onClick={() => {
            const e = {
              id: uid(),
              name: `Environment ${envs.length}`,
              vars: [emptyRow()],
            }
            setEnvs((es) => [...es, e])
            setSelId(e.id)
          }}
          className="[display:flex] [align-items:center] [gap:6px] [padding:10px_12px] [background:none] [border:none] [cursor:pointer] [color:var(--text-3)] [font-size:12px] [width:100%]"
        >
          <Plus size={12} /> New
        </button>
      </div>
      <div className="[flex:1] [overflow-y:auto] [min-width:0]">
        {!sel ? (
          <p className="[padding:16px] [color:var(--text-4)] [font-size:12px]">
            Select an environment.
          </p>
        ) : (
          <div>
            <div className="[display:flex] [align-items:center] [gap:8px] [padding:12px] [border-bottom:1px_solid_var(--border)]">
              <input
                value={sel.name}
                disabled={!editable}
                onChange={(e) =>
                  setEnvs((es) =>
                    es.map((x) =>
                      x.id === selId ? { ...x, name: e.target.value } : x,
                    ),
                  )
                }
                className="h-[34px] w-full box-border rounded-md border border-[var(--border)] bg-[var(--bg)] px-2.5 text-[13px] text-[var(--text-1)] tracking-[-0.004em] outline-none transition-colors focus:border-[var(--accent)] [flex:1]"
              />
              {sel.id === activeEnvId ? (
                <span
                  style={{
                    fontFamily: MONO,
                  }}
                  className="[font-size:11px] [color:var(--green)]"
                >
                  active
                </span>
              ) : (
                <button
                  onClick={() => setActiveEnvId(sel.id)}
                  className="h-8 rounded-md border border-[var(--border)] bg-transparent px-3.5 text-[13px] font-medium tracking-[-0.01em] text-[var(--text-2)] cursor-pointer transition-colors hover:border-[var(--border-2)] hover:bg-[var(--bg-3)] [height:30px]"
                >
                  Activate
                </button>
              )}
              {editable && (
                <button
                  onClick={() => {
                    setEnvs((es) => es.filter((x) => x.id !== selId))
                    if (activeEnvId === selId) setActiveEnvId("no-env")
                    setSelId("no-env")
                  }}
                  className="h-8 rounded-md border border-[var(--border)] bg-transparent px-3.5 text-[13px] font-medium tracking-[-0.01em] text-[var(--text-2)] cursor-pointer transition-colors hover:border-[var(--border-2)] hover:bg-[var(--bg-3)] [height:30px]"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
            {editable ? (
              <KVEditor
                rows={sel.vars.length ? sel.vars : [emptyRow()]}
                setRows={updateVars}
                keyPlaceholder="Variable"
                valPlaceholder="Value"
              />
            ) : (
              <p className="[padding:16px] [color:var(--text-4)] [font-size:12px]">
                The "No Environment" preset has no variables. Create a new
                environment to define <code>{"{{variables}}"}</code>.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
