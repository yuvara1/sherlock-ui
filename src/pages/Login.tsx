import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, AlertCircle, ShieldAlert, CheckCircle2, KeyRound, ArrowRight, Shield } from "lucide-react";
import { loginSchema } from "@/schemas/auth";
import { useAuthStore } from "@/stores/authStore";
import { NavbarLogo } from "@/components/ui/resizable-navbar";
import type { User } from "@/types";

// ── Input field ─────────────────────────────────────────────────────────────
function Field({ label, type = "text", value, onChange, onBlur, error, placeholder, autoComplete, suffix, extra }: {
  label: string; type?: string; value: string; onChange: (v: string) => void; onBlur?: () => void;
  error?: string; placeholder?: string; autoComplete?: string; suffix?: React.ReactNode; extra?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.75)", letterSpacing: "-0.002em" }}>{label}</label>
        {extra}
      </div>
      <div style={{ position: "relative" }}>
        <input
          type={type} value={value} placeholder={placeholder} autoComplete={autoComplete}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          style={{
            width: "100%", padding: suffix ? "11px 42px 11px 14px" : "11px 14px",
            background: "#1a1a1a",
            border: `1px solid ${error ? "rgba(239,68,68,0.6)" : focused ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 10, color: "#fff", fontSize: 14, fontFamily: "Geist, sans-serif",
            outline: "none", letterSpacing: "-0.004em", transition: "border-color 0.15s",
            boxSizing: "border-box",
          }}
        />
        {suffix && <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>{suffix}</div>}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            style={{ fontSize: 12, color: "#ef4444", display: "flex", alignItems: "center", gap: 4, margin: 0 }}>
            <AlertCircle size={11} />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── MFA digit input ─────────────────────────────────────────────────────────
function MfaInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");
  const update = (arr: string[]) => onChange(arr.join("").replace(/\s+$/, ""));
  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[i]) { const a = [...digits]; a[i] = ""; update(a); }
      else if (i > 0) { const a = [...digits]; a[i - 1] = ""; update(a); refs.current[i - 1]?.focus(); }
    }
  };
  const handleChange = (i: number, v: string) => {
    const d = v.replace(/\D/g, "").slice(-1);
    if (!d) return;
    const a = [...digits]; a[i] = d; update(a);
    if (i < 5) refs.current[i + 1]?.focus();
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const p = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(p); refs.current[Math.min(p.length, 5)]?.focus();
  };
  return (
    <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
      {[0,1,2,3,4,5].map(i => (
        <input key={i} ref={el => { refs.current[i] = el; }} type="text" inputMode="numeric" maxLength={1}
          value={digits[i] || ""} onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)} onFocus={e => e.target.select()} onPaste={handlePaste}
          style={{ width: 44, height: 52, textAlign: "center", fontSize: 20, fontWeight: 700, fontFamily: "Geist Mono, monospace",
            background: digits[i] ? "rgba(255,255,255,0.08)" : "#1a1a1a",
            border: `1px solid ${digits[i] ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 10, color: "#fff", outline: "none", transition: "all 0.15s" }} />
      ))}
    </div>
  );
}

// ── Lockout banner ──────────────────────────────────────────────────────────
function LockoutBanner({ seconds, onExpire }: { seconds: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  useEffect(() => {
    const id = setInterval(() => setRemaining(r => { if (r <= 1) { clearInterval(id); onExpire(); return 0; } return r - 1; }), 1000);
    return () => clearInterval(id);
  }, []);
  const mins = Math.floor(remaining / 60), secs = remaining % 60;
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
      style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", gap: 10, alignItems: "flex-start" }}>
      <ShieldAlert size={15} style={{ color: "#ef4444", flexShrink: 0, marginTop: 1 }} />
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: "#ef4444", marginBottom: 2 }}>Account temporarily locked</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
          Try again in <span style={{ fontFamily: "Geist Mono, monospace", color: "#ef4444" }}>{mins > 0 ? `${mins}m ` : ""}{String(secs).padStart(2,"0")}s</span>
        </p>
      </div>
    </motion.div>
  );
}

// ── Shared styles ───────────────────────────────────────────────────────────
const btnWhite: React.CSSProperties = {
  width: "100%", padding: "12px", borderRadius: 10, border: "none", cursor: "pointer",
  background: "#fff", color: "#000", fontSize: 14, fontWeight: 600,
  fontFamily: "Geist, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  transition: "opacity 0.15s",
};

const btnOutline: React.CSSProperties = {
  width: "100%", padding: "12px", borderRadius: 10, cursor: "pointer",
  background: "#fff", color: "#000", fontSize: 14, fontWeight: 500,
  fontFamily: "Geist, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
  border: "1px solid rgba(255,255,255,0.15)", transition: "opacity 0.15s",
};

// ── Main Login ──────────────────────────────────────────────────────────────
type Step = "credentials" | "mfa" | "success";

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login, recordFailedAttempt, resetAttempts, isLocked, lockoutSecondsRemaining, lastEmail, rememberMe: savedRemember } = useAuthStore();

  const [email, setEmail] = useState(lastEmail);
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(savedRemember);
  const [mfaCode, setMfaCode] = useState("");
  const [step, setStep] = useState<Step>("credentials");
  const [errors, setErrors] = useState<Partial<Record<"email" | "password" | "mfaCode", string>>>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockSeconds, setLockSeconds] = useState(0);

  useEffect(() => { if (isLocked()) setLockSeconds(lockoutSecondsRemaining()); }, []);

  const verified = params.get("verified") === "1";
  const registered = params.get("registered") === "1";

  const validateField = useCallback((field: "email" | "password", val: string) => {
    const result = loginSchema.safeParse({ email: field === "email" ? val : email, password: field === "password" ? val : password });
    if (!result.success) {
      const fe = result.error.flatten().fieldErrors;
      setErrors(prev => ({ ...prev, [field]: fe[field]?.[0] }));
    } else {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
  }, [email, password]);

  const handleBlur = (field: "email" | "password") => {
    setTouched(prev => new Set(prev).add(field));
    validateField(field, field === "email" ? email : password);
  };

  const submitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked()) { setLockSeconds(lockoutSecondsRemaining()); return; }
    setTouched(new Set(["email", "password"]));
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) { const fe = result.error.flatten().fieldErrors; setErrors({ email: fe.email?.[0], password: fe.password?.[0] }); return; }
    setLoading(true); setGlobalError("");
    await new Promise(r => setTimeout(r, 900));
    if (password !== "Demo1234!" && email !== "demo@sherlock.dev") {
      const { locked } = recordFailedAttempt();
      setLoading(false);
      if (locked) { setLockSeconds(lockoutSecondsRemaining()); }
      else { setGlobalError("Incorrect email or password."); }
      return;
    }
    if (email === "demo@sherlock.dev" || remember === false) { setLoading(false); setStep("mfa"); return; }
    resetAttempts();
    const mockUser: User = { id: "usr-1", email, name: "Demo User", role: "OWNER", createdAt: new Date().toISOString() };
    login(mockUser, { accessToken: "mock_at", refreshToken: "mock_rt" }, remember);
    setLoading(false); setStep("success");
    setTimeout(() => navigate("/app/overview"), 900);
  };

  const submitMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length < 6) { setErrors({ mfaCode: "Enter all 6 digits" }); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    resetAttempts();
    const mockUser: User = { id: "usr-1", email, name: "Demo User", role: "OWNER", createdAt: new Date().toISOString() };
    login(mockUser, { accessToken: "mock_at", refreshToken: "mock_rt" }, remember);
    setLoading(false); setStep("success");
    setTimeout(() => navigate("/app/overview"), 900);
  };

  const locked = lockSeconds > 0;

  return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Geist, sans-serif", padding: "40px 20px" }}>

      <div style={{ width: "100%", maxWidth: 360 }}>
        <AnimatePresence mode="wait">

          {/* ── Credentials step ── */}
          {step === "credentials" && (
            <motion.div key="creds" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25, ease: [0.16,1,0.3,1] }}>
              {/* Logo */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
                <NavbarLogo />
              </div>

              {/* Heading */}
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", textAlign: "center", letterSpacing: "-0.025em", marginBottom: 6 }}>Sign in to your account</h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", textAlign: "center", letterSpacing: "-0.003em", marginBottom: 28, lineHeight: 1.5 }}>
                Welcome back! Please enter your details.
              </p>

              {/* Banners */}
              <AnimatePresence>
                {verified && (
                  <motion.div key="v" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ padding: "11px 14px", borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
                    <CheckCircle2 size={14} style={{ color: "#22c55e" }} />
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>Email verified! You can now sign in.</p>
                  </motion.div>
                )}
                {registered && (
                  <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ padding: "11px 14px", borderRadius: 10, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
                    <Shield size={14} style={{ color: "rgba(255,255,255,0.5)" }} />
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Account created! Verify your email then sign in.</p>
                  </motion.div>
                )}
                {locked && <div style={{ marginBottom: 16 }}><LockoutBanner seconds={lockSeconds} onExpire={() => setLockSeconds(0)} /></div>}
                {globalError && !locked && (
                  <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ padding: "11px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", display: "flex", gap: 8, marginBottom: 16 }}>
                    <AlertCircle size={14} style={{ color: "#ef4444", flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{globalError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={submitCredentials} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Field label="Email" type="email" value={email} onChange={v => { setEmail(v); if (touched.has("email")) validateField("email", v); }} onBlur={() => handleBlur("email")} error={touched.has("email") ? errors.email : undefined} placeholder="you@example.com" autoComplete="email" />
                <Field label="Password" type={showPass ? "text" : "password"} value={password}
                  onChange={v => { setPassword(v); if (touched.has("password")) validateField("password", v); }}
                  onBlur={() => handleBlur("password")} error={touched.has("password") ? errors.password : undefined}
                  placeholder="••••••••" autoComplete="current-password"
                  extra={<Link to="/forgot-password" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", letterSpacing: "-0.002em" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>Forgot?</Link>}
                  suffix={
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", padding: 0 }}
                      onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />

                <button type="submit" disabled={loading || locked}
                  style={{ ...btnWhite, opacity: loading || locked ? 0.5 : 1, cursor: loading || locked ? "not-allowed" : "pointer" }}>
                  {loading ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.6s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Signing in…</> : "Sign in"}
                </button>
              </form>

              {/* OR divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0" }}>
                <div style={{ flex: 1, borderTop: "1px dashed rgba(255,255,255,0.15)" }} />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em", fontWeight: 500 }}>OR</span>
                <div style={{ flex: 1, borderTop: "1px dashed rgba(255,255,255,0.15)" }} />
              </div>

              {/* Social buttons */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button type="button" style={btnOutline}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")} onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                  <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </button>
                <button type="button" style={btnOutline}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")} onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#000"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                  Continue with Apple
                </button>
              </div>

              <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "rgba(255,255,255,0.35)", letterSpacing: "-0.002em" }}>
                {"Don't have an account?"}{" "}
                <Link to="/register" style={{ color: "#fff", fontWeight: 700, textDecoration: "none" }}>Sign up</Link>
              </p>
            </motion.div>
          )}

          {/* ── MFA step ── */}
          {step === "mfa" && (
            <motion.div key="mfa" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25, ease: [0.16,1,0.3,1] }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
                <NavbarLogo />
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <KeyRound size={22} color="rgba(255,255,255,0.7)" />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.025em", marginBottom: 8 }}>Two-factor authentication</h2>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 6 }}>
                  Enter the 6-digit code sent to <strong style={{ color: "rgba(255,255,255,0.65)" }}>{email}</strong>
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", marginBottom: 28 }}>For demo: enter any 6 digits</p>
                <form onSubmit={submitMfa} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
                  <MfaInput value={mfaCode} onChange={setMfaCode} />
                  <AnimatePresence>
                    {errors.mfaCode && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ fontSize: 12, color: "#ef4444", display: "flex", alignItems: "center", gap: 4 }}>
                        <AlertCircle size={11} />{errors.mfaCode}
                      </motion.p>
                    )}
                  </AnimatePresence>
                  <button type="submit" disabled={loading || mfaCode.length < 6}
                    style={{ ...btnWhite, opacity: loading || mfaCode.length < 6 ? 0.4 : 1, cursor: loading || mfaCode.length < 6 ? "not-allowed" : "pointer" }}>
                    {loading ? <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.6s linear infinite" }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>Verifying…</> : <>Verify <ArrowRight size={14} /></>}
                  </button>
                  <div style={{ display: "flex", gap: 20 }}>
                    <button type="button" onClick={() => setStep("credentials")} style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer" }}>← Back</button>
                    <button type="button" style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", background: "none", border: "none", cursor: "pointer" }}>Resend code</button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {/* ── Success ── */}
          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16 }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: "spring", stiffness: 260 }}
                style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={28} color="#fff" />
              </motion.div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.025em", marginBottom: 6 }}>Signed in</h2>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Redirecting to your dashboard…</p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } } input::placeholder { color: rgba(255,255,255,0.2); }`}</style>
    </div>
  );
}
