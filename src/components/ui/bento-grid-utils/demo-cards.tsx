import { motion } from "motion/react";
import { Check } from "lucide-react";

/* ── AI Root Cause ── */
export function AiRootCauseDemo() {
  const lines = [
    { k: "confidence", v: '"91%"',                     c: "text-white" },
    { k: "rootCause",  v: '"HikariCP pool exhausted"', c: "text-white" },
    { k: "service",    v: '"payment-service"',          c: "text-white/60" },
    { k: "fix",        v: '"add index + pool ×2.4"',   c: "text-white/60" },
    { k: "blast",      v: '"checkout, cart"',           c: "text-white/40" },
  ];
  return (
    <div className="font-mono text-[11px] leading-[1.9] p-1">
      <div className="text-[9px] tracking-widest uppercase text-white/25 mb-2">AI analysis · INC-094</div>
      {lines.map(({ k, v, c }, i) => (
        <motion.div
          key={k}
          className="flex gap-2"
          initial={{ opacity: 0, x: -6 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + i * 0.09, duration: 0.28 }}
        >
          <span className="text-white/35">{k}</span>
          <span className="text-white/18">:</span>
          <span className={c}>{v}</span>
        </motion.div>
      ))}
    </div>
  );
}

/* ── MTTR Bar ── */
export function MttrDemo() {
  const bars = [
    { label: "Before", val: "48 min", pct: 100, dim: true  },
    { label: "After",  val: "8 min",  pct: 17,  dim: false },
  ];
  return (
    <div className="flex flex-col gap-3 pt-1">
      <div className="font-mono text-[28px] font-black text-white leading-none tracking-tight">6×</div>
      <div className="text-[10px] text-white/35 -mt-1">faster mean time to resolution</div>
      {bars.map((b, i) => (
        <div key={b.label}>
          <div className="flex justify-between mb-1">
            <span className={`text-[9px] tracking-wide ${b.dim ? "text-white/28" : "text-white/55"}`}>{b.label}</span>
            <span className={`font-mono text-[9px] font-bold ${b.dim ? "text-white/22" : "text-white"}`}>{b.val}</span>
          </div>
          <div className="h-[4px] rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${b.dim ? "bg-white/[0.14]" : "bg-white/75"}`}
              initial={{ width: 0 }}
              whileInView={{ width: `${b.pct}%` }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 + i * 0.18, duration: 0.85, ease: "easeOut" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Alert Noise ── */
export function AlertNoiseDemo() {
  const alerts = [
    { label: "P0 · DB timeout",   active: true  },
    { label: "P3 · CPU spike",    active: false },
    { label: "P3 · Mem warn",     active: false },
    { label: "P2 · Error rate",   active: false },
  ];
  return (
    <div className="flex flex-col gap-2 pt-1">
      <div className="font-mono text-[28px] font-black text-white leading-none">−97%</div>
      <div className="text-[10px] text-white/35 -mt-1">alert noise suppressed</div>
      <div className="flex flex-col gap-[7px] mt-1">
        {alerts.map((a, i) => (
          <motion.div
            key={a.label}
            className={`flex items-center gap-2 ${a.active ? "opacity-100" : "opacity-28"}`}
            initial={{ opacity: 0, x: -6 }}
            whileInView={{ opacity: a.active ? 1 : 0.28, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.12 + i * 0.1, duration: 0.28 }}
          >
            {a.active
              ? <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.4 }}
                  className="w-[5px] h-[5px] rounded-full bg-white flex-shrink-0" />
              : <div className="w-[5px] h-[5px] rounded-full bg-white/20 flex-shrink-0" />}
            <span className={`text-[11px] flex-1 ${a.active ? "text-white" : "text-white/40"}`}>{a.label}</span>
            {!a.active && <span className="text-[9px] text-white/18 tracking-wide">suppressed</span>}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ── Trace Waterfall ── */
export function TraceWaterfallDemo() {
  const spans = [
    { svc: "api-gateway",  pct: 14,  ms: "21ms",  ok: true  },
    { svc: "payment-svc",  pct: 92,  ms: "28.4s", ok: false },
    { svc: "redis-cache",  pct: 5,   ms: "0.3ms", ok: true  },
    { svc: "db-primary",   pct: 88,  ms: "26.1s", ok: false },
  ];
  return (
    <div className="flex flex-col gap-[9px] pt-1 font-mono text-[10px]">
      {spans.map((s, i) => (
        <div key={s.svc} className="flex items-center gap-2">
          <span className="text-white/25 w-[74px] flex-shrink-0 text-[9px]">{s.svc}</span>
          <div className="flex-1 h-[4px] bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${s.ok ? "bg-white/45" : "bg-red-400/60"}`}
              initial={{ width: 0 }}
              whileInView={{ width: `${s.pct}%` }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + i * 0.12, duration: 0.6, ease: "easeOut" }}
            />
          </div>
          <span className={`w-10 text-right text-[9px] flex-shrink-0 ${s.ok ? "text-white/30" : "text-red-400"}`}>{s.ms}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Comparison Table ── */
const ROWS = [
  { f: "AI root cause",        s: true,  l: false },
  { f: "Zero-config OTel",     s: true,  l: false },
  { f: "Alert correlation",    s: true,  l: false },
  { f: "Dep blast radius",     s: true,  l: true  },
  { f: "Conversational debug", s: true,  l: false },
  { f: "30-day retention",     s: true,  l: false },
];

export function ComparisonTableDemo() {
  return (
    <div className="pt-1">
      <div className="grid grid-cols-[1fr_52px_52px] text-[9px] font-semibold tracking-widest uppercase text-white/22 pb-2 mb-2 border-b border-white/[0.07]">
        <span>Feature</span>
        <span className="text-center text-white/70">Us</span>
        <span className="text-center">Them</span>
      </div>
      {ROWS.map((r, i) => (
        <motion.div
          key={r.f}
          className="grid grid-cols-[1fr_52px_52px] py-[7px] border-b border-white/[0.045] last:border-none items-center"
          initial={{ opacity: 0, x: -6 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.06 + i * 0.07, duration: 0.28 }}
        >
          <span className="text-[11px] text-white/50">{r.f}</span>
          <div className="flex justify-center">
            {r.s
              ? <motion.div className="w-[16px] h-[16px] rounded-full bg-white/08 border border-white/20 flex items-center justify-center"
                  initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }}
                  transition={{ delay: 0.12 + i * 0.07, type: "spring", stiffness: 320 }}>
                  <Check size={9} className="text-white" />
                </motion.div>
              : <span className="text-white/15 text-[12px]">—</span>}
          </div>
          <div className="flex justify-center">
            {r.l
              ? <div className="w-[16px] h-[16px] rounded-full bg-white/03 border border-white/08 flex items-center justify-center">
                  <Check size={9} className="text-white/22" />
                </div>
              : <span className="text-white/12 text-[12px]">—</span>}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ── Language Chips ── */
export function LanguageChipsDemo() {
  const langs = ["Node.js", "Go", "Python", "Java", "Ruby", "Rust", ".NET", "PHP"];
  return (
    <div className="flex flex-wrap gap-[6px] pt-1">
      {langs.map((lang, i) => (
        <motion.span
          key={lang}
          className="font-mono text-[10px] text-white/42 border border-white/08 bg-white/[0.03] rounded-md px-2 py-[3px]"
          initial={{ opacity: 0, scale: 0.82 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 + i * 0.05, duration: 0.22 }}
        >
          {lang}
        </motion.span>
      ))}
    </div>
  );
}

/* ── Stat ── */
export function StatDemo({ stat, sub }: { stat: string; sub: string }) {
  return (
    <div className="flex flex-col gap-1 pt-1">
      <div className="font-mono text-[34px] font-black text-white leading-none tracking-tight">{stat}</div>
      <div className="text-[10px] text-white/35 leading-snug">{sub}</div>
    </div>
  );
}

/* ── Dep Graph ── */
export function DepGraphDemo() {
  const edges = [
    { from: "api-gateway", to: "payment-svc", ok: false },
    { from: "payment-svc", to: "db-primary",  ok: false },
    { from: "api-gateway", to: "auth-svc",    ok: true  },
    { from: "auth-svc",    to: "redis",        ok: true  },
  ];
  return (
    <div className="flex flex-col gap-[8px] pt-1 font-mono text-[10px]">
      {edges.map((e, i) => (
        <motion.div
          key={i}
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -6 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + i * 0.1, duration: 0.28 }}
        >
          <span className={e.ok ? "text-white/22" : "text-white/65"}>{e.from}</span>
          <motion.span
            animate={e.ok ? {} : { opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={e.ok ? "text-white/12" : "text-white/50"}
          >→</motion.span>
          <span className={e.ok ? "text-white/22" : "text-white/65"}>{e.to}</span>
          <span className={`ml-auto ${e.ok ? "text-white/28" : "text-red-400"}`}>{e.ok ? "✔" : "✘"}</span>
        </motion.div>
      ))}
    </div>
  );
}
