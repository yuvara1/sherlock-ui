import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { GridBackground } from "@/components/ui/GridBackground";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { MovingBorderBtn } from "@/components/ui/MovingBorderBtn";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1200);
  };

  return (
    <div
      className="dark"
      style={{
        minHeight: "100vh", background: "#000", display: "flex",
        alignItems: "center", justifyContent: "center", padding: "24px",
        fontFamily: "Geist, sans-serif", position: "relative", overflow: "hidden",
      }}
    >
      <GridBackground dots className="absolute inset-0 opacity-15" />

      {/* Subtle glow */}
      <div style={{
        position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 600, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(50,145,255,0.08) 0%, transparent 70%)",
        filter: "blur(60px)", pointerEvents: "none",
      }} />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 10 }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 32, justifyContent: "center" }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #3291ff 0%, #7c3aed 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" fill="white" />
              <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.5 3.5l1.4 1.4M11.1 11.1l1.4 1.4M3.5 12.5l1.4-1.4M11.1 4.9l1.4-1.4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em" }}>Sherlock</span>
        </div>

        {/* Card */}
        <div style={{
          position: "relative", borderRadius: 20, overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.07)",
          background: "rgba(255,255,255,0.025)",
        }}>
          <BorderBeam size={200} duration={10} colorFrom="#3291ff" colorTo="#7c3aed" />

          <div style={{ padding: "36px 32px" }}>
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: "50%",
                    background: "rgba(61,214,140,0.1)", border: "1px solid rgba(61,214,140,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <CheckCircle2 size={24} color="#3dd68c" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", marginBottom: 8 }}>
                      Check your email
                    </h2>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.6 }}>
                      If an account exists for <strong style={{ color: "rgba(255,255,255,0.7)" }}>{email}</strong>,{" "}
                      {"you'll receive a password reset link shortly."}
                    </p>
                  </div>
                  <Link
                    to="/login"
                    style={{
                      marginTop: 8, display: "inline-flex", alignItems: "center", gap: 6,
                      fontSize: 13, color: "#3291ff", textDecoration: "none", letterSpacing: "-0.004em",
                    }}
                  >
                    <ArrowLeft size={13} /> Back to sign in
                  </Link>
                </motion.div>
              ) : (
                <motion.div key="form">
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.025em", marginBottom: 6 }}>
                    Forgot password?
                  </h2>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", marginBottom: 28, lineHeight: 1.6 }}>
                    {"Enter your email and we'll send you a link to reset your password."}
                  </p>

                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 500, color: "#ededed" }}>Email address</label>
                      <div style={{ position: "relative" }}>
                        <Mail size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.3)", pointerEvents: "none" }} />
                        <input
                          type="email"
                          placeholder="you@company.com"
                          value={email}
                          required
                          onChange={e => setEmail(e.target.value)}
                          onFocus={() => setFocused(true)}
                          onBlur={() => setFocused(false)}
                          style={{
                            width: "100%", padding: "10px 14px 10px 36px",
                            background: "rgba(255,255,255,0.04)",
                            border: `1px solid ${focused ? "rgba(50,145,255,0.6)" : "rgba(255,255,255,0.08)"}`,
                            borderRadius: 10, color: "#ededed", fontSize: 13,
                            fontFamily: "Geist, sans-serif", outline: "none",
                            boxShadow: focused ? "0 0 0 3px rgba(50,145,255,0.12)" : "none",
                            transition: "border-color 0.15s, box-shadow 0.15s",
                          }}
                        />
                      </div>
                    </div>

                    <MovingBorderBtn type="submit" disabled={loading}>
                      {loading ? (
                        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.7s linear infinite" }}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                          Sending…
                        </span>
                      ) : "Send reset link"}
                    </MovingBorderBtn>
                  </form>

                  <div style={{ textAlign: "center", marginTop: 24 }}>
                    <Link
                      to="/login"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
                    >
                      <ArrowLeft size={13} /> Back to sign in
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
