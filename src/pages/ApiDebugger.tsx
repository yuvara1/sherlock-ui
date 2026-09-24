import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
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
} from "lucide-react";
import { useTheme } from "@/lib/theme";
import { SherlockSelect } from "@/components/ui/SherlockSelect";

/* ─── Constants ─── */
const MONO = "Geist Mono, monospace";
const SANS = "Geist, sans-serif";

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];
const METHODS_WITH_BODY = new Set(["POST", "PUT", "PATCH", "DELETE", "OPTIONS"]);

const METHOD_COLORS: Record<string, string> = {
  GET: "var(--accent)",
  POST: "var(--green)",
  PUT: "var(--yellow)",
  PATCH: "#8b5cf6",
  DELETE: "var(--red)",
  HEAD: "var(--text-3)",
  OPTIONS: "var(--text-3)",
};

const SAMPLE_URLS = [
  { label: "JSONPlaceholder · posts", url: "https://jsonplaceholder.typicode.com/posts/1", method: "GET" },
  { label: "JSONPlaceholder · create", url: "https://jsonplaceholder.typicode.com/posts", method: "POST" },
  { label: "httpbin · GET", url: "https://httpbin.org/get", method: "GET" },
  { label: "httpbin · POST", url: "https://httpbin.org/post", method: "POST" },
  { label: "GitHub · Zen", url: "https://api.github.com/zen", method: "GET" },
];

const LS = {
  tabs: "sherlock.api.tabs.v2",
  history: "sherlock.api.history.v2",
  collections: "sherlock.api.collections.v2",
  envs: "sherlock.api.envs.v2",
  activeEnv: "sherlock.api.activeEnv.v2",
};

/* ─── Types ─── */
interface KV {
  id: string;
  key: string;
  val: string;
  on: boolean;
  type?: "text" | "file";
  file?: File;
}
type AuthType = "none" | "bearer" | "basic" | "apikey";
type BodyType = "none" | "raw" | "form-data" | "urlencoded" | "graphql";
type RawLang = "json" | "text" | "xml" | "html" | "javascript";

type TestKind =
  | "status"
  | "time"
  | "bodyContains"
  | "jsonEquals"
  | "headerExists";
interface TestRow {
  id: string;
  kind: TestKind;
  target: string;
  value: string;
  on: boolean;
}
interface TestResult {
  name: string;
  passed: boolean;
  detail: string;
}

interface ReqState {
  method: string;
  url: string;
  params: KV[];
  headers: KV[];
  authType: AuthType;
  bearer: string;
  basicUser: string;
  basicPass: string;
  apiKeyName: string;
  apiKeyValue: string;
  apiKeyIn: "header" | "query";
  bodyType: BodyType;
  rawLang: RawLang;
  rawBody: string;
  formData: KV[];
  urlencoded: KV[];
  graphqlQuery: string;
  graphqlVars: string;
  tests: TestRow[];
}

interface ApiResponse {
  status: number;
  statusText: string;
  ok: boolean;
  timeMs: number;
  sizeBytes: number;
  contentType: string;
  headers: [string, string][];
  body: string;
  blobUrl: string;
  isJson: boolean;
  isHtml: boolean;
  isImage: boolean;
  error?: string;
  tests: TestResult[];
}

interface Tab {
  id: string;
  name: string;
  req: ReqState;
  response: ApiResponse | null;
  loading: boolean;
  dirty: boolean;
}

interface HistoryItem {
  id: string;
  method: string;
  url: string;
  status: number | null;
  ok: boolean;
  timeMs: number | null;
  ts: number;
  error?: boolean;
}

interface SavedRequest {
  id: string;
  name: string;
  req: ReqState;
}
interface Collection {
  id: string;
  name: string;
  requests: SavedRequest[];
}

interface Environment {
  id: string;
  name: string;
  vars: KV[];
}

/* ─── Helpers ─── */
const uid = () => Math.random().toString(36).slice(2, 9);
const emptyRow = (): KV => ({ id: uid(), key: "", val: "", on: true, type: "text" });

function newReq(partial?: Partial<ReqState>): ReqState {
  return {
    method: "GET",
    url: "https://jsonplaceholder.typicode.com/posts/1",
    params: [emptyRow()],
    headers: [{ id: uid(), key: "Accept", val: "application/json", on: true, type: "text" }],
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
  };
}

function newTab(req?: ReqState): Tab {
  const r = req ?? newReq();
  return { id: uid(), name: tabName(r), req: r, response: null, loading: false, dirty: false };
}

function tabName(r: ReqState) {
  try {
    const u = new URL(r.url);
    const seg = u.pathname.split("/").filter(Boolean).pop();
    return seg || u.hostname;
  } catch {
    return r.url.slice(0, 18) || "New Request";
  }
}

function fmtMs(ms: number | null) {
  if (ms == null) return "—";
  return ms >= 1000 ? `${(ms / 1000).toFixed(2)}s` : `${Math.round(ms)}ms`;
}
function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}
function statusColor(code: number) {
  if (code === 0) return "var(--red)";
  if (code < 300) return "var(--green)";
  if (code < 400) return "var(--accent)";
  if (code < 500) return "var(--yellow)";
  return "var(--red)";
}
function methodColor(m: string) {
  return METHOD_COLORS[m] ?? "var(--text-3)";
}
function relTime(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

/** Substitute {{var}} tokens using the active environment. */
function resolveVars(str: string, vars: Record<string, string>) {
  return str.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, k) =>
    k in vars ? vars[k] : `{{${k}}}`,
  );
}

/** Get a value from parsed JSON via a dotted path (supports [i]). */
function jsonPath(obj: unknown, path: string): unknown {
  const parts = path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);
  let cur: unknown = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return cur;
}

function buildCurl(r: ReqState, finalUrl: string, headers: Record<string, string>, bodyStr?: string) {
  const parts = [`curl -X ${r.method} '${finalUrl}'`];
  Object.entries(headers).forEach(([k, v]) => parts.push(`  -H '${k}: ${v}'`));
  if (bodyStr) parts.push(`  --data '${bodyStr.replace(/'/g, "'\\''")}'`);
  return parts.join(" \\\n");
}

function parseCurl(text: string): Partial<ReqState> | null {
  const t = text.trim().replace(/\\\n/g, " ");
  if (!/^curl\b/.test(t)) return null;
  const out: Partial<ReqState> = { headers: [], params: [emptyRow()] };
  const methodM = t.match(/-X\s+(\w+)/);
  if (methodM) out.method = methodM[1].toUpperCase();
  // url: first quoted or bare http token
  const urlM = t.match(/'(https?:\/\/[^']+)'|"(https?:\/\/[^"]+)"|\s(https?:\/\/\S+)/);
  if (urlM) out.url = (urlM[1] || urlM[2] || urlM[3]).trim();
  const headers: KV[] = [];
  const hRe = /-H\s+'([^']+)'|-H\s+"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = hRe.exec(t))) {
    const raw = m[1] || m[2];
    const idx = raw.indexOf(":");
    if (idx > -1)
      headers.push({ id: uid(), key: raw.slice(0, idx).trim(), val: raw.slice(idx + 1).trim(), on: true, type: "text" });
  }
  out.headers = headers.length ? headers : [emptyRow()];
  const dataM = t.match(/(?:--data|--data-raw|-d)\s+'([^']*)'|(?:--data|--data-raw|-d)\s+"([^"]*)"/);
  if (dataM) {
    out.bodyType = "raw";
    out.rawLang = "json";
    out.rawBody = dataM[1] || dataM[2] || "";
    if (!out.method) out.method = "POST";
  }
  return out;
}

function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function saveLS(key: string, val: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    /* ignore */
  }
}
/** Strip File objects (non-serializable) before persisting. */
function sanitizeReq(r: ReqState): ReqState {
  return {
    ...r,
    formData: r.formData.map((row) => ({ ...row, file: undefined })),
  };
}

/* ─── Atoms ─── */
function MethodTag({ method, size = 10 }: { method: string; size?: number }) {
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: size,
        fontWeight: 700,
        letterSpacing: "0.04em",
        color: methodColor(method),
        flexShrink: 0,
      }}
    >
      {method}
    </span>
  );
}

function IconBtn({
  onClick,
  title,
  children,
  active,
  danger,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        height: 30,
        padding: "0 10px",
        borderRadius: 6,
        border: "1px solid var(--border)",
        background: active ? "var(--bg-3)" : "transparent",
        color: danger ? "var(--red)" : "var(--text-3)",
        fontSize: 12,
        fontFamily: SANS,
        cursor: "pointer",
        whiteSpace: "nowrap",
        transition: "background 0.1s, color 0.1s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--bg-3)";
        if (!danger) e.currentTarget.style.color = "var(--text-1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = active ? "var(--bg-3)" : "transparent";
        if (!danger) e.currentTarget.style.color = "var(--text-3)";
      }}
    >
      {children}
    </button>
  );
}

function CopyBtn({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(value).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 8px",
        borderRadius: 5,
        border: "1px solid var(--border)",
        background: "transparent",
        cursor: "pointer",
        fontFamily: MONO,
        fontSize: 10,
        color: copied ? "var(--green)" : "var(--text-4)",
      }}
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
      {copied ? "Copied" : label}
    </button>
  );
}

/* ─── Key/Value editor ─── */
function KVEditor({
  rows,
  setRows,
  keyPlaceholder = "Key",
  valPlaceholder = "Value",
  allowFiles = false,
}: {
  rows: KV[];
  setRows: (r: KV[]) => void;
  keyPlaceholder?: string;
  valPlaceholder?: string;
  allowFiles?: boolean;
}) {
  const update = (id: string, patch: Partial<KV>) =>
    setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => setRows(rows.filter((r) => r.id !== id));

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
  };

  return (
    <div>
      {rows.map((r) => (
        <div
          key={r.id}
          style={{
            display: "flex",
            alignItems: "center",
            borderBottom: "1px solid var(--border)",
            background: r.on ? "transparent" : "var(--bg-2)",
          }}
        >
          <input
            type="checkbox"
            checked={r.on}
            onChange={(e) => update(r.id, { on: e.target.checked })}
            style={{ margin: "0 8px", accentColor: "var(--accent)", flexShrink: 0 }}
            aria-label="Enable row"
          />
          <input
            value={r.key}
            onChange={(e) => update(r.id, { key: e.target.value })}
            placeholder={keyPlaceholder}
            style={{ ...inputStyle, borderRight: "1px solid var(--border)" }}
            spellCheck={false}
          />
          {allowFiles && r.type === "file" ? (
            <label
              style={{
                ...inputStyle,
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                color: "var(--text-3)",
              }}
            >
              {r.file ? r.file.name : "Choose file…"}
              <input
                type="file"
                style={{ display: "none" }}
                onChange={(e) =>
                  update(r.id, { file: e.target.files?.[0], val: e.target.files?.[0]?.name ?? "" })
                }
              />
            </label>
          ) : (
            <input
              value={r.val}
              onChange={(e) => update(r.id, { val: e.target.value })}
              placeholder={valPlaceholder}
              style={inputStyle}
              spellCheck={false}
            />
          )}
          {allowFiles && (
            <button
              onClick={() =>
                update(r.id, { type: r.type === "file" ? "text" : "file", file: undefined, val: "" })
              }
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-4)",
                fontSize: 10,
                fontFamily: MONO,
                padding: "0 6px",
                flexShrink: 0,
              }}
              title="Toggle text / file"
            >
              {r.type === "file" ? "file" : "text"}
            </button>
          )}
          <button
            onClick={() => remove(r.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-4)",
              padding: "0 10px",
              display: "flex",
              alignItems: "center",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--red)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-4)")}
            aria-label="Remove row"
          >
            <X size={13} />
          </button>
        </div>
      ))}
      <button
        onClick={() => setRows([...rows, emptyRow()])}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "8px 12px",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-3)",
          fontSize: 12,
          fontFamily: SANS,
        }}
      >
        <Plus size={12} />
        Add row
      </button>
    </div>
  );
}

const TAB_KINDS: { value: TestKind; label: string }[] = [
  { value: "status", label: "Status code equals" },
  { value: "time", label: "Response time < (ms)" },
  { value: "bodyContains", label: "Body contains" },
  { value: "jsonEquals", label: "JSON path equals" },
  { value: "headerExists", label: "Header exists / equals" },
];

/* ─── Main ─── */
export default function ApiDebugger() {
  const { theme } = useTheme();
  const monacoTheme = theme === "dark" ? "vs-dark" : "vs";

  const [tabs, setTabs] = useState<Tab[]>(() => {
    const saved = loadLS<Tab[]>(LS.tabs, []);
    return saved.length ? saved.map((t) => ({ ...t, loading: false })) : [newTab()];
  });
  const [activeTabId, setActiveTabId] = useState<string>(() => "");
  const [history, setHistory] = useState<HistoryItem[]>(() => loadLS(LS.history, []));
  const [collections, setCollections] = useState<Collection[]>(() =>
    loadLS(LS.collections, [{ id: uid(), name: "My Collection", requests: [] }]),
  );
  const [envs, setEnvs] = useState<Environment[]>(() =>
    loadLS(LS.envs, [
      { id: "no-env", name: "No Environment", vars: [] },
      {
        id: uid(),
        name: "Local",
        vars: [
          { id: uid(), key: "baseUrl", val: "https://jsonplaceholder.typicode.com", on: true, type: "text" },
          { id: uid(), key: "token", val: "", on: true, type: "text" },
        ],
      },
    ]),
  );
  const [activeEnvId, setActiveEnvId] = useState<string>(() => loadLS(LS.activeEnv, "no-env"));

  const [sidebarTab, setSidebarTab] = useState<"history" | "collections">("history");
  const [historyFilter, setHistoryFilter] = useState("");
  const [reqTab, setReqTab] = useState<"params" | "headers" | "auth" | "body" | "tests">("params");
  const [resTab, setResTab] = useState<"body" | "headers" | "cookies" | "tests">("body");
  const [bodyView, setBodyView] = useState<"pretty" | "raw" | "preview">("pretty");
  const [wrap, setWrap] = useState(true);
  const [envModalOpen, setEnvModalOpen] = useState(false);
  const [curlModalOpen, setCurlModalOpen] = useState(false);
  const [curlText, setCurlText] = useState("");
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [saveCollId, setSaveCollId] = useState("");
  const [expandedColls, setExpandedColls] = useState<Set<string>>(new Set());

  const abortRef = useRef<AbortController | null>(null);

  /* Ensure a valid active tab */
  useEffect(() => {
    if (!tabs.length) {
      const t = newTab();
      setTabs([t]);
      setActiveTabId(t.id);
    } else if (!tabs.find((t) => t.id === activeTabId)) {
      setActiveTabId(tabs[0].id);
    }
  }, [tabs, activeTabId]);

  /* Persist */
  useEffect(() => saveLS(LS.tabs, tabs.map((t) => ({ ...t, req: sanitizeReq(t.req), loading: false }))), [tabs]);
  useEffect(() => saveLS(LS.history, history.slice(0, 60)), [history]);
  useEffect(() => saveLS(LS.collections, collections), [collections]);
  useEffect(() => saveLS(LS.envs, envs), [envs]);
  useEffect(() => saveLS(LS.activeEnv, activeEnvId), [activeEnvId]);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? tabs[0];
  const req = activeTab?.req ?? newReq();

  const patchReq = useCallback(
    (patch: Partial<ReqState>) => {
      setTabs((prev) =>
        prev.map((t) =>
          t.id === activeTab?.id
            ? { ...t, req: { ...t.req, ...patch }, dirty: true, name: patch.url ? tabName({ ...t.req, ...patch }) : t.name }
            : t,
        ),
      );
    },
    [activeTab?.id],
  );

  const patchTab = useCallback(
    (patch: Partial<Tab>) => {
      setTabs((prev) => prev.map((t) => (t.id === activeTab?.id ? { ...t, ...patch } : t)));
    },
    [activeTab?.id],
  );

  const envVars = useMemo(() => {
    const env = envs.find((e) => e.id === activeEnvId);
    const rec: Record<string, string> = {};
    env?.vars.filter((v) => v.on && v.key.trim()).forEach((v) => (rec[v.key] = v.val));
    return rec;
  }, [envs, activeEnvId]);

  const enabledParams = req.params.filter((p) => p.on && p.key.trim());

  const finalUrl = useMemo(() => {
    const base = resolveVars(req.url, envVars);
    const extra = [...enabledParams];
    if (req.authType === "apikey" && req.apiKeyIn === "query" && req.apiKeyName)
      extra.push({ id: "ak", key: req.apiKeyName, val: resolveVars(req.apiKeyValue, envVars), on: true });
    if (!extra.length) return base;
    try {
      const u = new URL(base);
      extra.forEach((p) => u.searchParams.set(resolveVars(p.key, envVars), resolveVars(p.val, envVars)));
      return u.toString();
    } catch {
      const qs = extra
        .map((p) => `${encodeURIComponent(resolveVars(p.key, envVars))}=${encodeURIComponent(resolveVars(p.val, envVars))}`)
        .join("&");
      return base + (base.includes("?") ? "&" : "?") + qs;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [req.url, req.params, req.authType, req.apiKeyIn, req.apiKeyName, req.apiKeyValue, envVars]);

  const hasBody = req.bodyType !== "none" && METHODS_WITH_BODY.has(req.method);

  function buildHeaders(): Record<string, string> {
    const hdrs: Record<string, string> = {};
    req.headers
      .filter((h) => h.on && h.key.trim())
      .forEach((h) => (hdrs[resolveVars(h.key, envVars)] = resolveVars(h.val, envVars)));
    if (req.authType === "bearer" && req.bearer.trim())
      hdrs["Authorization"] = `Bearer ${resolveVars(req.bearer, envVars).trim()}`;
    if (req.authType === "basic")
      hdrs["Authorization"] = `Basic ${btoa(`${resolveVars(req.basicUser, envVars)}:${resolveVars(req.basicPass, envVars)}`)}`;
    if (req.authType === "apikey" && req.apiKeyIn === "header" && req.apiKeyName.trim())
      hdrs[req.apiKeyName] = resolveVars(req.apiKeyValue, envVars);
    if (hasBody && (req.bodyType === "raw" || req.bodyType === "graphql") && !hdrs["Content-Type"])
      hdrs["Content-Type"] = req.bodyType === "graphql" ? "application/json" : rawContentType(req.rawLang);
    if (hasBody && req.bodyType === "urlencoded" && !hdrs["Content-Type"])
      hdrs["Content-Type"] = "application/x-www-form-urlencoded";
    return hdrs;
  }

  function buildBody(): { body: BodyInit | undefined; preview: string | undefined } {
    if (!hasBody) return { body: undefined, preview: undefined };
    if (req.bodyType === "raw") {
      const b = resolveVars(req.rawBody, envVars);
      return { body: b, preview: b };
    }
    if (req.bodyType === "graphql") {
      const b = JSON.stringify({
        query: resolveVars(req.graphqlQuery, envVars),
        variables: safeJson(resolveVars(req.graphqlVars, envVars)),
      });
      return { body: b, preview: b };
    }
    if (req.bodyType === "urlencoded") {
      const usp = new URLSearchParams();
      req.urlencoded
        .filter((r) => r.on && r.key.trim())
        .forEach((r) => usp.append(resolveVars(r.key, envVars), resolveVars(r.val, envVars)));
      return { body: usp.toString(), preview: usp.toString() };
    }
    // form-data
    const fd = new FormData();
    req.formData
      .filter((r) => r.on && r.key.trim())
      .forEach((r) => {
        if (r.type === "file" && r.file) fd.append(r.key, r.file);
        else fd.append(resolveVars(r.key, envVars), resolveVars(r.val, envVars));
      });
    return { body: fd, preview: "[multipart/form-data]" };
  }

  function runTests(res: Omit<ApiResponse, "tests">): TestResult[] {
    const results: TestResult[] = [];
    let parsed: unknown;
    for (const t of req.tests.filter((t) => t.on)) {
      try {
        if (t.kind === "status") {
          const exp = Number(t.value);
          results.push({
            name: `Status is ${exp}`,
            passed: res.status === exp,
            detail: `got ${res.status}`,
          });
        } else if (t.kind === "time") {
          const exp = Number(t.value);
          results.push({
            name: `Response < ${exp}ms`,
            passed: res.timeMs < exp,
            detail: `${Math.round(res.timeMs)}ms`,
          });
        } else if (t.kind === "bodyContains") {
          results.push({
            name: `Body contains "${t.value}"`,
            passed: res.body.includes(t.value),
            detail: res.body.includes(t.value) ? "found" : "not found",
          });
        } else if (t.kind === "headerExists") {
          const found = res.headers.find(([k]) => k.toLowerCase() === t.target.toLowerCase());
          const passed = t.value ? found?.[1] === t.value : !!found;
          results.push({
            name: t.value ? `${t.target} = ${t.value}` : `Header ${t.target} exists`,
            passed,
            detail: found ? found[1] : "absent",
          });
        } else if (t.kind === "jsonEquals") {
          if (parsed === undefined) parsed = safeJson(res.body);
          const actual = jsonPath(parsed, t.target);
          const passed = String(actual) === t.value;
          results.push({
            name: `${t.target} = ${t.value}`,
            passed,
            detail: `got ${JSON.stringify(actual)}`,
          });
        }
      } catch (e) {
        results.push({ name: t.kind, passed: false, detail: String(e) });
      }
    }
    return results;
  }

  const pushHistory = useCallback((item: HistoryItem) => setHistory((h) => [item, ...h].slice(0, 60)), []);

  const send = useCallback(async () => {
    if (!req.url.trim() || activeTab?.loading) return;
    patchTab({ loading: true, response: null });
    setResTab("body");
    setBodyView("pretty");

    const controller = new AbortController();
    abortRef.current = controller;
    const headers = buildHeaders();
    const { body } = buildBody();
    // Let the browser set the multipart boundary for FormData.
    if (body instanceof FormData) delete headers["Content-Type"];

    const started = performance.now();
    try {
      const res = await fetch(finalUrl, { method: req.method, headers, body, signal: controller.signal });
      const blob = await res.blob();
      const text = await blob.text();
      const timeMs = performance.now() - started;
      const ct = res.headers.get("content-type") ?? "";
      const isJson = ct.includes("json") || /^\s*[[{]/.test(text);
      const isHtml = ct.includes("html");
      const isImage = ct.startsWith("image/");
      let pretty = text;
      if (isJson) {
        try {
          pretty = JSON.stringify(JSON.parse(text), null, 2);
        } catch {
          /* keep raw */
        }
      }
      const resHeaders: [string, string][] = [];
      res.headers.forEach((v, k) => resHeaders.push([k, v]));
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
      };
      const tests = runTests(base);
      patchTab({ loading: false, response: { ...base, tests } });
      pushHistory({ id: uid(), method: req.method, url: finalUrl, status: res.status, ok: res.ok, timeMs, ts: Date.now() });
    } catch (err) {
      const timeMs = performance.now() - started;
      const aborted = controller.signal.aborted;
      const message = aborted ? "Request cancelled" : err instanceof Error ? err.message : "Request failed";
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
      });
      if (!aborted)
        pushHistory({ id: uid(), method: req.method, url: finalUrl, status: null, ok: false, timeMs, ts: Date.now(), error: true });
    } finally {
      abortRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [req, finalUrl, activeTab?.loading, patchTab, pushHistory]);

  const cancel = () => abortRef.current?.abort();

  /* Tab management */
  const addTab = () => {
    const t = newTab();
    setTabs((p) => [...p, t]);
    setActiveTabId(t.id);
  };
  const closeTab = (id: string) => {
    setTabs((p) => {
      const next = p.filter((t) => t.id !== id);
      if (id === activeTabId && next.length) setActiveTabId(next[next.length - 1].id);
      return next.length ? next : [newTab()];
    });
  };

  const openRequest = (r: ReqState) => {
    const t = newTab(structuredClone(r));
    setTabs((p) => [...p, t]);
    setActiveTabId(t.id);
  };

  const doSave = () => {
    if (!saveName.trim() || !saveCollId) return;
    setCollections((cs) =>
      cs.map((c) =>
        c.id === saveCollId
          ? { ...c, requests: [...c.requests, { id: uid(), name: saveName.trim(), req: sanitizeReq(req) }] }
          : c,
      ),
    );
    patchTab({ dirty: false, name: saveName.trim() });
    setSaveModalOpen(false);
    setSaveName("");
    setSidebarTab("collections");
    setExpandedColls((s) => new Set(s).add(saveCollId));
  };

  const importCurl = () => {
    const parsed = parseCurl(curlText);
    if (parsed) {
      const t = newTab(newReq(parsed));
      setTabs((p) => [...p, t]);
      setActiveTabId(t.id);
      setCurlModalOpen(false);
      setCurlText("");
    }
  };

  const copyCurl = () => {
    const { preview } = buildBody();
    const curl = buildCurl(req, finalUrl, buildHeaders(), preview === "[multipart/form-data]" ? undefined : preview);
    navigator.clipboard?.writeText(curl).catch(() => {});
  };

  const filteredHistory = historyFilter
    ? history.filter(
        (h) =>
          h.url.toLowerCase().includes(historyFilter.toLowerCase()) ||
          h.method.toLowerCase().includes(historyFilter.toLowerCase()),
      )
    : history;

  const formatRaw = () => {
    if (req.rawLang !== "json") return;
    try {
      patchReq({ rawBody: JSON.stringify(JSON.parse(req.rawBody), null, 2) });
    } catch {
      /* leave */
    }
  };

  const response = activeTab?.response ?? null;
  const loading = activeTab?.loading ?? false;

  const reqTabs: { id: typeof reqTab; label: string; count?: number }[] = [
    { id: "params", label: "Params", count: enabledParams.length || undefined },
    { id: "headers", label: "Headers", count: req.headers.filter((h) => h.on && h.key.trim()).length || undefined },
    { id: "auth", label: "Auth" },
    { id: "body", label: "Body" },
    { id: "tests", label: "Tests", count: req.tests.length || undefined },
  ];

  const tabBtn = (active: boolean, onClick: () => void, label: React.ReactNode) => (
    <button
      onClick={onClick}
      style={{
        padding: "0 14px",
        height: 36,
        fontSize: 12,
        fontWeight: 500,
        color: active ? "var(--text-1)" : "var(--text-4)",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        fontFamily: SANS,
        borderBottom: active ? "2px solid var(--text-1)" : "2px solid transparent",
        transition: "color 0.12s",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );

  const countBadge = (n: number) => (
    <span
      style={{
        fontSize: 9,
        fontFamily: MONO,
        fontWeight: 700,
        padding: "0 4px",
        borderRadius: 4,
        background: "var(--bg-3)",
        color: "var(--text-3)",
        border: "1px solid var(--border)",
      }}
    >
      {n}
    </span>
  );

  const passCount = response?.tests.filter((t) => t.passed).length ?? 0;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        fontFamily: SANS,
        background: "var(--bg)",
      }}
    >
      {/* Page header */}
      <div
        className="responsive-page-header"
        style={{
          padding: "18px 32px 14px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 600, letterSpacing: "-0.02em", color: "var(--text-1)", margin: "0 0 3px" }}>
            API Debugger
          </h1>
          <p style={{ fontSize: 13, color: "var(--text-3)", margin: 0 }}>
            A full HTTP client — send live requests, script tests, manage environments
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Globe size={13} style={{ color: "var(--text-4)" }} />
            <SherlockSelect
              value={activeEnvId}
              onChange={setActiveEnvId}
              options={envs.map((e) => ({ value: e.id, label: e.name }))}
              minWidth={150}
              align="end"
            />
          </div>
          <IconBtn onClick={() => setEnvModalOpen(true)} title="Manage environments">
            Environments
          </IconBtn>
          <IconBtn onClick={() => setCurlModalOpen(true)} title="Import from cURL">
            <Download size={12} />
            Import
          </IconBtn>
        </div>
      </div>

      {/* Body: sidebar + main */}
      <div className="debugger-layout" style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>
        {/* Sidebar */}
        <div
          className="debugger-sidebar"
          style={{
            width: 260,
            flexShrink: 0,
            borderRight: "1px solid var(--border)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Sidebar tab switch */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
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
              <div style={{ padding: "8px 12px", borderBottom: "1px solid var(--border)", flexShrink: 0, display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-2)", flex: 1 }}>
                  <Search size={12} style={{ color: "var(--text-4)", flexShrink: 0 }} />
                  <input
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value)}
                    placeholder="Filter..."
                    style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", fontSize: 12, color: "var(--text-1)", fontFamily: SANS }}
                  />
                </div>
                {history.length > 0 && (
                  <button onClick={() => setHistory([])} title="Clear history" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-4)", display: "flex" }}>
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {filteredHistory.length === 0 ? (
                  <div style={{ padding: "20px 16px", textAlign: "center", fontSize: 12, color: "var(--text-4)", lineHeight: 1.6 }}>
                    No requests yet.
                    <div style={{ marginTop: 12, textAlign: "left" }}>
                      <p style={{ fontSize: 10, fontFamily: MONO, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-4)", margin: "0 0 6px" }}>Try a sample</p>
                      {SAMPLE_URLS.map((s) => (
                        <button
                          key={s.url}
                          onClick={() => patchReq({ url: s.url, method: s.method, bodyType: s.method === "POST" ? "raw" : req.bodyType })}
                          style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 8px", marginBottom: 2, borderRadius: 5, border: "1px solid var(--border)", background: "var(--bg-2)", color: "var(--text-2)", fontSize: 11, cursor: "pointer" }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  filteredHistory.map((h) => (
                    <button key={h.id} onClick={() => patchReq({ method: h.method, url: h.url })} style={historyItemStyle}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <MethodTag method={h.method} />
                        <span style={{ fontSize: 11, fontFamily: MONO, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                          {h.url.replace(/^https?:\/\//, "")}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, fontFamily: MONO, fontWeight: 700, color: h.status ? statusColor(h.status) : "var(--red)" }}>
                          {h.error ? "ERR" : h.status}
                        </span>
                        <span style={{ fontSize: 10, fontFamily: MONO, color: "var(--text-4)" }}>{fmtMs(h.timeMs)}</span>
                        <span style={{ fontSize: 10, fontFamily: MONO, color: "var(--text-4)", marginLeft: "auto" }}>{relTime(h.ts)}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          )}

          {sidebarTab === "collections" && (
            <div style={{ flex: 1, overflowY: "auto", padding: 8 }}>
              {collections.map((c) => {
                const open = expandedColls.has(c.id);
                return (
                  <div key={c.id} style={{ marginBottom: 4 }}>
                    <button
                      onClick={() =>
                        setExpandedColls((s) => {
                          const n = new Set(s);
                          n.has(c.id) ? n.delete(c.id) : n.add(c.id);
                          return n;
                        })
                      }
                      style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", padding: "6px 8px", borderRadius: 6, background: "transparent", border: "none", cursor: "pointer", color: "var(--text-2)", fontSize: 12, fontWeight: 500 }}
                    >
                      {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      <FolderOpen size={12} style={{ color: "var(--text-4)" }} />
                      <span style={{ flex: 1, textAlign: "left" }}>{c.name}</span>
                      {countBadge(c.requests.length)}
                    </button>
                    {open &&
                      c.requests.map((r) => (
                        <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px 5px 26px", borderRadius: 6 }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-2)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <button onClick={() => openRequest(r.req)} style={{ display: "flex", alignItems: "center", gap: 6, flex: 1, background: "none", border: "none", cursor: "pointer", textAlign: "left", minWidth: 0 }}>
                            <MethodTag method={r.req.method} size={9} />
                            <span style={{ fontSize: 11, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.name}</span>
                          </button>
                          <button
                            onClick={() => setCollections((cs) => cs.map((cc) => (cc.id === c.id ? { ...cc, requests: cc.requests.filter((rr) => rr.id !== r.id) } : cc)))}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-4)", display: "flex" }}
                            title="Delete"
                          >
                            <X size={11} />
                          </button>
                        </div>
                      ))}
                    {open && c.requests.length === 0 && (
                      <p style={{ padding: "4px 8px 8px 26px", fontSize: 11, color: "var(--text-4)", margin: 0 }}>Empty — save a request here.</p>
                    )}
                  </div>
                );
              })}
              <button
                onClick={() => setCollections((cs) => [...cs, { id: uid(), name: `Collection ${cs.length + 1}`, requests: [] }])}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: 12, width: "100%" }}
              >
                <Plus size={12} /> New collection
              </button>
            </div>
          )}
        </div>

        {/* Main panel */}
        <div className="debugger-main" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          {/* Request tabs bar */}
          <div style={{ display: "flex", alignItems: "center", borderBottom: "1px solid var(--border)", flexShrink: 0, background: "var(--bg)", overflowX: "auto" }}>
            {tabs.map((t) => (
              <div
                key={t.id}
                onClick={() => setActiveTabId(t.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "0 10px",
                  height: 36,
                  cursor: "pointer",
                  borderRight: "1px solid var(--border)",
                  background: t.id === activeTabId ? "var(--bg-2)" : "transparent",
                  borderBottom: t.id === activeTabId ? "2px solid var(--accent)" : "2px solid transparent",
                  flexShrink: 0,
                  maxWidth: 180,
                }}
              >
                <MethodTag method={t.req.method} size={9} />
                <span style={{ fontSize: 12, color: t.id === activeTabId ? "var(--text-1)" : "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.name}
                  {t.dirty && <span style={{ color: "var(--yellow)" }}> •</span>}
                </span>
                <button
                  onClick={(e) => { e.stopPropagation(); closeTab(t.id); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-4)", display: "flex", padding: 2, flexShrink: 0 }}
                >
                  <X size={11} />
                </button>
              </div>
            ))}
            <button onClick={addTab} title="New request tab" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", padding: "0 12px", height: 36, display: "flex", alignItems: "center", flexShrink: 0 }}>
              <Plus size={14} />
            </button>
          </div>

          {/* Request bar */}
          <div className="debugger-request-bar" style={{ padding: "12px 20px", borderBottom: "1px solid var(--border)", flexShrink: 0, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ flexShrink: 0 }}>
              <SherlockSelect value={req.method} onChange={(v) => patchReq({ method: v })} options={METHODS} minWidth={104} />
            </div>
            <input
              value={req.url}
              onChange={(e) => patchReq({ url: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder="https://api.example.com/endpoint  (supports {{variables}})"
              spellCheck={false}
              style={{ flex: 1, minWidth: 180, height: 34, padding: "0 12px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--bg-2)", color: "var(--text-1)", fontSize: 13, fontFamily: MONO, outline: "none" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
            />
            {loading ? (
              <button onClick={cancel} style={sendBtnStyle("var(--red-bg)", "var(--red)", "var(--red-border)")}>
                <X size={13} /> Cancel
              </button>
            ) : (
              <button onClick={send} style={sendBtnStyle("var(--accent)", "#fff", "var(--accent)")}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <Send size={13} /> Send
              </button>
            )}
            <IconBtn onClick={() => { setSaveName(activeTab?.name ?? ""); setSaveCollId(collections[0]?.id ?? ""); setSaveModalOpen(true); }} title="Save request">
              <Save size={12} /> Save
            </IconBtn>
            <IconBtn onClick={copyCurl} title="Copy as cURL">
              <TerminalSquare size={12} /> cURL
            </IconBtn>
          </div>

          {/* Request config tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)", flexShrink: 0, overflowX: "auto" }}>
            {reqTabs.map((t) =>
              tabBtn(
                reqTab === t.id,
                () => setReqTab(t.id),
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  {t.label}
                  {t.count != null && countBadge(t.count)}
                </span>,
              ),
            )}
          </div>

          {/* Request config content */}
          <div style={{ flexShrink: 0, maxHeight: "40%", overflowY: "auto", borderBottom: "1px solid var(--border)", background: "var(--bg)" }}>
            {reqTab === "params" && <KVEditor rows={req.params} setRows={(r) => patchReq({ params: r })} keyPlaceholder="Parameter" />}
            {reqTab === "headers" && <KVEditor rows={req.headers} setRows={(r) => patchReq({ headers: r })} keyPlaceholder="Header" />}
            {reqTab === "auth" && (
              <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "var(--text-3)" }}>Type</span>
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
                  <input value={req.bearer} onChange={(e) => patchReq({ bearer: e.target.value })} placeholder="Token" spellCheck={false} className="dialog-input" style={{ fontFamily: MONO, maxWidth: 480 }} />
                )}
                {req.authType === "basic" && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <input value={req.basicUser} onChange={(e) => patchReq({ basicUser: e.target.value })} placeholder="Username" spellCheck={false} className="dialog-input" style={{ fontFamily: MONO, maxWidth: 236 }} />
                    <input value={req.basicPass} onChange={(e) => patchReq({ basicPass: e.target.value })} placeholder="Password" type="password" className="dialog-input" style={{ fontFamily: MONO, maxWidth: 236 }} />
                  </div>
                )}
                {req.authType === "apikey" && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <input value={req.apiKeyName} onChange={(e) => patchReq({ apiKeyName: e.target.value })} placeholder="Key" spellCheck={false} className="dialog-input" style={{ fontFamily: MONO, maxWidth: 180 }} />
                    <input value={req.apiKeyValue} onChange={(e) => patchReq({ apiKeyValue: e.target.value })} placeholder="Value" spellCheck={false} className="dialog-input" style={{ fontFamily: MONO, maxWidth: 236 }} />
                    <SherlockSelect value={req.apiKeyIn} onChange={(v) => patchReq({ apiKeyIn: v as "header" | "query" })} options={[{ value: "header", label: "Add to Header" }, { value: "query", label: "Add to Query" }]} minWidth={150} />
                  </div>
                )}
                {req.authType === "none" && <p style={{ fontSize: 12, color: "var(--text-4)", margin: 0 }}>This request does not use authorization.</p>}
              </div>
            )}
            {reqTab === "body" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderBottom: "1px solid var(--border)", flexWrap: "wrap" }}>
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
                      <SherlockSelect value={req.rawLang} onChange={(v) => patchReq({ rawLang: v as RawLang })} options={["json", "text", "xml", "html", "javascript"]} minWidth={110} />
                      {req.rawLang === "json" && (
                        <button onClick={formatRaw} style={{ fontSize: 11, color: "var(--text-3)", background: "none", border: "1px solid var(--border)", borderRadius: 5, padding: "3px 8px", cursor: "pointer" }}>Format</button>
                      )}
                    </>
                  )}
                  {!METHODS_WITH_BODY.has(req.method) && (
                    <span style={{ fontSize: 11, color: "var(--yellow)", fontFamily: MONO }}>{req.method} usually has no body</span>
                  )}
                </div>
                {req.bodyType === "none" && <p style={{ padding: 16, fontSize: 12, color: "var(--text-4)", margin: 0 }}>This request has no body.</p>}
                {req.bodyType === "raw" && (
                  <div style={{ height: 200 }}>
                    <Editor height="200px" language={req.rawLang} theme={monacoTheme} value={req.rawBody} onChange={(v) => patchReq({ rawBody: v ?? "" })} options={editorOpts} />
                  </div>
                )}
                {req.bodyType === "form-data" && <KVEditor rows={req.formData} setRows={(r) => patchReq({ formData: r })} keyPlaceholder="Field" allowFiles />}
                {req.bodyType === "urlencoded" && <KVEditor rows={req.urlencoded} setRows={(r) => patchReq({ urlencoded: r })} keyPlaceholder="Field" />}
                {req.bodyType === "graphql" && (
                  <div>
                    <div style={{ padding: "6px 12px", fontSize: 10, fontFamily: MONO, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Query</div>
                    <div style={{ height: 150 }}>
                      <Editor height="150px" language="graphql" theme={monacoTheme} value={req.graphqlQuery} onChange={(v) => patchReq({ graphqlQuery: v ?? "" })} options={editorOpts} />
                    </div>
                    <div style={{ padding: "6px 12px", fontSize: 10, fontFamily: MONO, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.05em", borderTop: "1px solid var(--border)" }}>Variables (JSON)</div>
                    <div style={{ height: 90 }}>
                      <Editor height="90px" language="json" theme={monacoTheme} value={req.graphqlVars} onChange={(v) => patchReq({ graphqlVars: v ?? "" })} options={editorOpts} />
                    </div>
                  </div>
                )}
              </div>
            )}
            {reqTab === "tests" && (
              <TestsEditor rows={req.tests} setRows={(r) => patchReq({ tests: r })} />
            )}
          </div>

          {/* Response area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "0 20px", minHeight: 40, borderBottom: "1px solid var(--border)", flexShrink: 0, background: "var(--bg)", flexWrap: "wrap" }}>
              {!response && !loading && <span style={{ fontSize: 12, color: "var(--text-4)" }}>Send a request to see the response</span>}
              {loading && (
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-3)" }}>
                  <Loader2 size={13} style={{ animation: "conic-spin 0.8s linear infinite" }} /> Sending request…
                </span>
              )}
              {response && !loading && (
                <>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: MONO, fontSize: 12, fontWeight: 700, color: statusColor(response.status) }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor(response.status), display: "block" }} />
                    {response.status === 0 ? response.statusText : `${response.status} ${response.statusText}`}
                  </span>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--text-3)" }}>{fmtMs(response.timeMs)}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--text-3)" }}>{fmtBytes(response.sizeBytes)}</span>
                  {response.tests.length > 0 && (
                    <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 600, color: passCount === response.tests.length ? "var(--green)" : "var(--red)" }}>
                      Tests {passCount}/{response.tests.length}
                    </span>
                  )}
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
                    {resTab === "body" && (
                      <button onClick={() => setWrap((w) => !w)} title="Toggle word wrap" style={{ display: "flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 5, border: "1px solid var(--border)", background: wrap ? "var(--bg-3)" : "transparent", cursor: "pointer", fontSize: 10, fontFamily: MONO, color: "var(--text-3)" }}>
                        <WrapText size={11} /> Wrap
                      </button>
                    )}
                    <CopyBtn value={response.body} />
                  </div>
                </>
              )}
            </div>

            {response && !loading && (
              <div style={{ display: "flex", borderBottom: "1px solid var(--border)", flexShrink: 0, alignItems: "center" }}>
                {tabBtn(resTab === "body", () => setResTab("body"), "Body")}
                {tabBtn(resTab === "headers", () => setResTab("headers"), <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>Headers {countBadge(response.headers.length)}</span>)}
                {tabBtn(resTab === "cookies", () => setResTab("cookies"), "Cookies")}
                {tabBtn(resTab === "tests", () => setResTab("tests"), <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>Tests {response.tests.length > 0 && countBadge(response.tests.length)}</span>)}
                {resTab === "body" && !response.error && (
                  <div style={{ marginLeft: "auto", display: "flex", gap: 2, padding: "0 8px" }}>
                    {(["pretty", "raw", "preview"] as const).map((m) => (
                      <button key={m} onClick={() => setBodyView(m)} style={{ fontSize: 11, fontFamily: SANS, padding: "3px 8px", borderRadius: 5, border: "none", background: bodyView === m ? "var(--bg-3)" : "transparent", color: bodyView === m ? "var(--text-1)" : "var(--text-4)", cursor: "pointer", textTransform: "capitalize" }}>{m}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Response content */}
            <div style={{ flex: 1, minHeight: 0, overflow: "hidden", background: "var(--bg)" }}>
              {response && !loading && resTab === "body" && (
                <>
                  {response.error && <div style={errorBodyStyle}>{response.body}</div>}
                  {!response.error && bodyView === "raw" && (
                    <pre style={{ margin: 0, padding: "12px 20px", fontFamily: MONO, fontSize: 12, lineHeight: 1.7, color: "var(--text-2)", overflow: "auto", height: "100%", boxSizing: "border-box", whiteSpace: wrap ? "pre-wrap" : "pre" }}>{response.body}</pre>
                  )}
                  {!response.error && bodyView === "preview" && (
                    response.isImage && response.blobUrl ? (
                      <div style={{ height: "100%", overflow: "auto", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
                        <img src={response.blobUrl} alt="response" style={{ maxWidth: "100%", maxHeight: "100%" }} />
                      </div>
                    ) : response.isHtml ? (
                      <iframe title="preview" srcDoc={response.body} sandbox="" style={{ width: "100%", height: "100%", border: "none", background: "#fff" }} />
                    ) : (
                      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-4)", fontSize: 12 }}>No preview for {response.contentType || "this content type"}</div>
                    )
                  )}
                  {!response.error && bodyView === "pretty" && (
                    <Editor height="100%" language={response.isJson ? "json" : response.isHtml ? "html" : "plaintext"} theme={monacoTheme} value={response.body} options={{ ...editorOpts, readOnly: true, wordWrap: wrap ? "on" : "off" }} />
                  )}
                </>
              )}
              {response && !loading && resTab === "headers" && (
                <div style={{ overflowY: "auto", height: "100%" }}>
                  {response.headers.map(([k, v], i) => (
                    <div key={i} style={{ display: "grid", gridTemplateColumns: "220px 1fr", alignItems: "center", padding: "0 20px", minHeight: 38, borderBottom: "1px solid var(--border)" }}>
                      <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--text-2)" }}>{k}</span>
                      <span style={{ fontFamily: MONO, fontSize: 12, color: "var(--text-3)", wordBreak: "break-all", padding: "8px 0" }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {response && !loading && resTab === "cookies" && (
                <div style={{ padding: 20 }}>
                  {(() => {
                    const setCookie = response.headers.filter(([k]) => k.toLowerCase() === "set-cookie");
                    if (!setCookie.length)
                      return <p style={{ fontSize: 12, color: "var(--text-4)", margin: 0, lineHeight: 1.6 }}>No cookies exposed. Browsers hide <code>Set-Cookie</code> from fetch for cross-origin responses; cookies are still stored by the browser when applicable.</p>;
                    return setCookie.map(([, v], i) => (
                      <div key={i} style={{ fontFamily: MONO, fontSize: 12, color: "var(--text-2)", padding: "6px 0", borderBottom: "1px solid var(--border)" }}>{v}</div>
                    ));
                  })()}
                </div>
              )}
              {response && !loading && resTab === "tests" && (
                <div style={{ overflowY: "auto", height: "100%" }}>
                  {response.tests.length === 0 ? (
                    <p style={{ padding: 20, fontSize: 12, color: "var(--text-4)", margin: 0 }}>No tests defined. Add assertions in the request "Tests" tab; they run automatically after each response.</p>
                  ) : (
                    response.tests.map((t, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 20px", borderBottom: "1px solid var(--border)" }}>
                        {t.passed ? <CheckCircle2 size={14} style={{ color: "var(--green)" }} /> : <XCircle size={14} style={{ color: "var(--red)" }} />}
                        <span style={{ fontSize: 12, color: "var(--text-1)", flex: 1 }}>{t.name}</span>
                        <span style={{ fontFamily: MONO, fontSize: 11, color: "var(--text-4)" }}>{t.detail}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
              {!response && !loading && (
                <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, color: "var(--text-4)" }}>
                  <Send size={22} />
                  <span style={{ fontSize: 13 }}>No response yet</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Modals ─── */}
      {envModalOpen && (
        <Modal title="Environments" onClose={() => setEnvModalOpen(false)} wide>
          <EnvManager envs={envs} setEnvs={setEnvs} activeEnvId={activeEnvId} setActiveEnvId={setActiveEnvId} />
        </Modal>
      )}
      {curlModalOpen && (
        <Modal title="Import from cURL" onClose={() => setCurlModalOpen(false)}>
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            <textarea
              value={curlText}
              onChange={(e) => setCurlText(e.target.value)}
              placeholder="curl -X POST 'https://api.example.com' -H 'Content-Type: application/json' --data '{...}'"
              className="dialog-textarea"
              style={{ fontFamily: MONO, minHeight: 160, fontSize: 12 }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="dialog-btn-secondary" onClick={() => setCurlModalOpen(false)}>Cancel</button>
              <button className="dialog-btn-primary" onClick={importCurl}>Import</button>
            </div>
          </div>
        </Modal>
      )}
      {saveModalOpen && (
        <Modal title="Save Request" onClose={() => setSaveModalOpen(false)}>
          <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="dialog-field">
              <label>Request name</label>
              <input className="dialog-input" value={saveName} onChange={(e) => setSaveName(e.target.value)} placeholder="Get user" autoFocus />
            </div>
            <div className="dialog-field">
              <label>Collection</label>
              <SherlockSelect value={saveCollId} onChange={setSaveCollId} options={collections.map((c) => ({ value: c.id, label: c.name }))} minWidth="100%" />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="dialog-btn-secondary" onClick={() => setSaveModalOpen(false)}>Cancel</button>
              <button className="dialog-btn-primary" onClick={doSave}>
                <Star size={12} style={{ marginRight: 4, display: "inline" }} /> Save
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
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
};

function rawContentType(lang: RawLang) {
  return lang === "json"
    ? "application/json"
    : lang === "xml"
      ? "application/xml"
      : lang === "html"
        ? "text/html"
        : lang === "javascript"
          ? "application/javascript"
          : "text/plain";
}

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return undefined;
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
  };
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
};

function sendBtnStyle(bg: string, color: string, border: string): React.CSSProperties {
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
  };
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
};

function TestsEditor({ rows, setRows }: { rows: TestRow[]; setRows: (r: TestRow[]) => void }) {
  const update = (id: string, patch: Partial<TestRow>) => setRows(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const needsTarget = (k: TestKind) => k === "jsonEquals" || k === "headerExists";
  return (
    <div style={{ padding: 12 }}>
      <p style={{ fontSize: 11, color: "var(--text-4)", margin: "0 0 10px", lineHeight: 1.5 }}>
        Assertions run automatically after each response. Results appear in the response "Tests" tab.
      </p>
      {rows.map((r) => (
        <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
          <input type="checkbox" checked={r.on} onChange={(e) => update(r.id, { on: e.target.checked })} style={{ accentColor: "var(--accent)" }} />
          <SherlockSelect value={r.kind} onChange={(v) => update(r.id, { kind: v as TestKind })} options={TAB_KINDS.map((k) => ({ value: k.value, label: k.label }))} minWidth={190} />
          {needsTarget(r.kind) && (
            <input value={r.target} onChange={(e) => update(r.id, { target: e.target.value })} placeholder={r.kind === "jsonEquals" ? "path e.g. data.id" : "header name"} className="dialog-input" style={{ fontFamily: MONO, maxWidth: 160, height: 30 }} />
          )}
          <input value={r.value} onChange={(e) => update(r.id, { value: e.target.value })} placeholder="expected value" className="dialog-input" style={{ fontFamily: MONO, maxWidth: 160, height: 30 }} />
          <button onClick={() => setRows(rows.filter((x) => x.id !== r.id))} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-4)", display: "flex" }}>
            <X size={13} />
          </button>
        </div>
      ))}
      <button
        onClick={() => setRows([...rows, { id: uid(), kind: "status", target: "", value: "200", on: true }])}
        style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 0", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: 12 }}
      >
        <Plus size={12} /> Add assertion
      </button>
    </div>
  );
}

function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="sherlock-dialog-overlay" onClick={onClose}>
      <div
        className="sherlock-dialog-content"
        style={{ width: wide ? "min(720px, calc(100vw - 32px))" : undefined }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sherlock-dialog-header">
          <h2 className="sherlock-dialog-title">{title}</h2>
        </div>
        <button className="sherlock-dialog-close" onClick={onClose}><X size={13} /></button>
        {children}
      </div>
    </div>
  );
}

function EnvManager({
  envs,
  setEnvs,
  activeEnvId,
  setActiveEnvId,
}: {
  envs: Environment[];
  setEnvs: React.Dispatch<React.SetStateAction<Environment[]>>;
  activeEnvId: string;
  setActiveEnvId: (id: string) => void;
}) {
  const [selId, setSelId] = useState(() => envs.find((e) => e.id !== "no-env")?.id ?? envs[0]?.id ?? "");
  const sel = envs.find((e) => e.id === selId);
  const editable = sel && sel.id !== "no-env";

  const updateVars = (vars: KV[]) => setEnvs((es) => es.map((e) => (e.id === selId ? { ...e, vars } : e)));

  return (
    <div style={{ display: "flex", minHeight: 320, maxHeight: "60vh" }}>
      <div style={{ width: 200, borderRight: "1px solid var(--border)", overflowY: "auto", flexShrink: 0 }}>
        {envs.map((e) => (
          <div key={e.id} style={{ display: "flex", alignItems: "center" }}>
            <button
              onClick={() => setSelId(e.id)}
              style={{ flex: 1, textAlign: "left", padding: "10px 12px", background: e.id === selId ? "var(--bg-3)" : "transparent", border: "none", borderBottom: "1px solid var(--border)", cursor: "pointer", color: "var(--text-2)", fontSize: 12, display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}
            >
              {e.id === activeEnvId && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", flexShrink: 0 }} />}
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
            </button>
          </div>
        ))}
        <button
          onClick={() => {
            const e = { id: uid(), name: `Environment ${envs.length}`, vars: [emptyRow()] };
            setEnvs((es) => [...es, e]);
            setSelId(e.id);
          }}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 12px", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: 12, width: "100%" }}
        >
          <Plus size={12} /> New
        </button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", minWidth: 0 }}>
        {!sel ? (
          <p style={{ padding: 16, color: "var(--text-4)", fontSize: 12 }}>Select an environment.</p>
        ) : (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px", borderBottom: "1px solid var(--border)" }}>
              <input
                value={sel.name}
                disabled={!editable}
                onChange={(e) => setEnvs((es) => es.map((x) => (x.id === selId ? { ...x, name: e.target.value } : x)))}
                className="dialog-input"
                style={{ flex: 1 }}
              />
              {sel.id === activeEnvId ? (
                <span style={{ fontSize: 11, color: "var(--green)", fontFamily: MONO }}>active</span>
              ) : (
                <button className="dialog-btn-secondary" style={{ height: 30 }} onClick={() => setActiveEnvId(sel.id)}>Activate</button>
              )}
              {editable && (
                <button
                  className="dialog-btn-secondary"
                  style={{ height: 30 }}
                  onClick={() => {
                    setEnvs((es) => es.filter((x) => x.id !== selId));
                    if (activeEnvId === selId) setActiveEnvId("no-env");
                    setSelId("no-env");
                  }}
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
            {editable ? (
              <KVEditor rows={sel.vars.length ? sel.vars : [emptyRow()]} setRows={updateVars} keyPlaceholder="Variable" valPlaceholder="Value" />
            ) : (
              <p style={{ padding: 16, color: "var(--text-4)", fontSize: 12 }}>The "No Environment" preset has no variables. Create a new environment to define <code>{"{{variables}}"}</code>.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
