export default function Placeholder({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center">
        <p className="text-[11px] font-mono uppercase tracking-widest mb-2" style={{ color: "var(--text-4)" }}>{desc}</p>
        <h2 style={{ fontSize: "14px", fontWeight: 600, letterSpacing: "-0.008em", color: "var(--text-1)" }}>{title}</h2>
        <p className="text-[12px] font-mono mt-2" style={{ color: "var(--text-4)" }}>This section is under construction.</p>
      </div>
    </div>
  );
}
