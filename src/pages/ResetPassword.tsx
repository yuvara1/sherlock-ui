import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, Check, X } from "lucide-react";
import { getPasswordStrength, resetPasswordSchema } from "@/schemas/auth";

function SherlockLogo({ size = 28 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size * 0.28, background: "linear-gradient(135deg,#3291ff 0%,#7c3aed 100%)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="3" fill="white" />
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function StrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const { score, label, color, checks } = getPasswordStrength(password);
  return (
    <div style={{ paddingTop: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <div style={{ flex: 1, display: "flex", gap: 4 }}>
          {[0, 1, 2, 3, 4].map(i => <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i < score ? color : "rgba(255,255,255,0.08)", transition: "background 0.3s" }} />)}
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color, letterSpacing: "-0.002em", minWidth: 60, textAlign: "right" }}>{label}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px" }}>
        {checks.map(c => (
          <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 13, height: 13, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: c.passed ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${c.passed ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"}`, transition: "all 0.2s" }}>
              {c.passed ? <Check size={7} color="#22c55e" strokeWidth={3} /> : <X size={7} color="rgba(255,255,255,0.2)" strokeWidth={3} />}
            </div>
            <span style={{ fontSize: 11, color: c.passed ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.22)" }}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") ?? "demo";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [focusedPass, setFocusedPass] = useState(false);
  const [focusedConfirm, setFocusedConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(new Set(["password", "confirm"]));
    const result = resetPasswordSchema.safeParse({ password, confirmPassword: confirm });
    if (!result.success) {
      const fe = result.error.flatten().fieldErrors;
      setErrors({ password: fe.password?.[0], confirm: fe.confirmPassword?.[0] });
      return;
    }
    const { score } = getPasswordStrength(password);
    if (score < 3) { setErrors({ password: "Password is too weak" }); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setDone(true);
    setTimeout(() => navigate("/login"), 2000);
  };

  const fieldBorder = (field: "pass" | "confirm") => {
    const err = field === "pass" ? errors.password : errors.confirm;
    const val = field === "pass" ? password : confirm;
    const focused = field === "pass" ? focusedPass : focusedConfirm;
    if (err && touched.has(field === "pass" ? "password" : "confirm")) return "rgba(239,68,68,0.7)";
    if (val && !err) return "rgba(34,197,94,0.4)";
    if (focused) return "rgba(50,145,255,0.65)";
    return "rgba(255,255,255,0.08)";
  };

  return (
    <div className="dark" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Geist, sans-serif", background: "#050510", position: "relative" }}>
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(circle at 50% 30%, rgba(50,145,255,0.06) 0%, transparent 60%), linear-gradient(rgba(50,145,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(50,145,255,0.02) 1px, transparent 1px)", backgroundSize: "100%, 44px 44px, 44px 44px", pointerEvents: "none" }} />

      <Link to="/" style={{ position: "fixed", top: 24, left: 28, display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
        <SherlockLogo size={26} />
        <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>Sherlock</span>
      </Link>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "100%", maxWidth: 400, position: "relative", zIndex: 1 }}>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 220 }}
                style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={30} color="#22c55e" />
              </motion.div>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.025em", marginBottom: 6 }}>Password reset</h2>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)" }}>Redirecting you to sign in…</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form">
              <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", marginBottom: 6, textAlign: "center" }}>Set new password</h1>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", letterSpacing: "-0.004em", textAlign: "center", marginBottom: 28 }}>
                {"Create a strong password that you haven't used before."}
              </p>

              {!token && (
                <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", gap: 10, alignItems: "center", marginBottom: 20 }}>
                  <AlertCircle size={14} color="#ef4444" />
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>This reset link is invalid or has expired. <Link to="/forgot-password" style={{ color: "#3291ff" }}>Request a new one.</Link></p>
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.55)", display: "block", marginBottom: 5 }}>New password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPass ? "text" : "password"} value={password} placeholder="Create a strong password" autoComplete="new-password"
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => setFocusedPass(true)} onBlur={() => { setFocusedPass(false); setTouched(p => new Set(p).add("password")); }}
                      style={{ width: "100%", padding: "10px 42px 10px 14px", background: "rgba(255,255,255,0.04)", border: `1px solid ${fieldBorder("pass")}`, borderRadius: 10, color: "#ededed", fontSize: 13, fontFamily: "Geist, sans-serif", outline: "none", letterSpacing: "-0.004em", boxShadow: focusedPass ? "0 0 0 3px rgba(50,145,255,0.1)" : "none", transition: "all 0.15s" }} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", padding: 0 }}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {password && <StrengthMeter password={password} />}
                  {touched.has("password") && errors.password && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={11} />{errors.password}</p>}
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.55)", display: "block", marginBottom: 5 }}>Confirm password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showConfirm ? "text" : "password"} value={confirm} placeholder="Repeat your password" autoComplete="new-password"
                      onChange={e => setConfirm(e.target.value)}
                      onFocus={() => setFocusedConfirm(true)} onBlur={() => { setFocusedConfirm(false); setTouched(p => new Set(p).add("confirm")); }}
                      style={{ width: "100%", padding: "10px 42px 10px 14px", background: "rgba(255,255,255,0.04)", border: `1px solid ${fieldBorder("confirm")}`, borderRadius: 10, color: "#ededed", fontSize: 13, fontFamily: "Geist, sans-serif", outline: "none", letterSpacing: "-0.004em", boxShadow: focusedConfirm ? "0 0 0 3px rgba(50,145,255,0.1)" : "none", transition: "all 0.15s" }} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", padding: 0 }}>
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {touched.has("confirm") && errors.confirm && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 5, display: "flex", alignItems: "center", gap: 4 }}><AlertCircle size={11} />{errors.confirm}</p>}
                </div>

                <button type="submit" disabled={loading}
                  style={{ marginTop: 4, width: "100%", padding: "11px", borderRadius: 10, border: "none", cursor: loading ? "not-allowed" : "pointer", background: loading ? "rgba(255,255,255,0.08)" : "linear-gradient(135deg,#3291ff,#7c3aed)", color: loading ? "rgba(255,255,255,0.3)" : "#fff", fontSize: 14, fontWeight: 600, letterSpacing: "-0.008em", fontFamily: "Geist, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s" }}>
                  {loading ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.6s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Resetting…</> : <>Reset password <ArrowRight size={14} /></>}
                </button>

                <Link to="/login" style={{ display: "block", textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.28)", textDecoration: "none", letterSpacing: "-0.003em" }}>
                  Back to sign in
                </Link>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
