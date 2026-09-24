import { Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Home, Search } from "lucide-react";
import { NavbarLogo } from "@/components/ui/resizable-navbar";

const QUICK_LINKS = [
  { label: "Overview", to: "/app/overview" },
  { label: "Incidents", to: "/app/incidents" },
  { label: "Pricing", to: "/#pricing" },
  { label: "Sign in", to: "/login" },
];

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      className="dark"
      style={{
        minHeight: "100vh",
        background: "#000",
        color: "#fff",
        fontFamily: "Geist, sans-serif",
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden",
      }}
    >
      {/* faint dot grid */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, #000 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, #000 20%, transparent 75%)",
        }}
      />

      {/* top logo */}
      <header style={{ position: "relative", zIndex: 10, padding: "24px 20px" }}>
        <NavbarLogo />
      </header>

      {/* center content */}
      <main
        style={{
          position: "relative",
          zIndex: 10,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "40px 20px 80px",
          width: "100%",
          maxWidth: 560,
          margin: "0 auto",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ width: "100%" }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 500,
              padding: "4px 12px",
              borderRadius: 99,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.14)",
              color: "rgba(255,255,255,0.55)",
              marginBottom: 28,
            }}
          >
            <Search size={11} />
            Error 404
          </span>

          <div
            style={{
              fontSize: "clamp(84px, 26vw, 180px)",
              fontWeight: 800,
              letterSpacing: "-0.06em",
              lineHeight: 0.9,
              color: "transparent",
              WebkitTextStroke: "1.5px rgba(255,255,255,0.14)",
              userSelect: "none",
              marginBottom: 8,
            }}
          >
            404
          </div>

          <h1
            style={{
              fontSize: "clamp(24px, 6vw, 34px)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              margin: "0 0 12px",
              lineHeight: 1.15,
            }}
          >
            This trace leads nowhere.
          </h1>
          <p
            style={{
              fontSize: "clamp(14px, 3.5vw, 16px)",
              color: "rgba(255,255,255,0.42)",
              lineHeight: 1.6,
              margin: "0 auto 32px",
              maxWidth: 380,
            }}
          >
            The page you're looking for was moved, renamed, or never existed. Let's get you back on a healthy path.
          </p>

          {/* actions — stack on mobile, row on wider */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              justifyContent: "center",
              marginBottom: 40,
            }}
          >
            <Link to="/" style={{ textDecoration: "none", flex: "1 1 auto", maxWidth: 220 }}>
              <button
                style={{
                  width: "100%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#000",
                  background: "#fff",
                  border: "none",
                  borderRadius: 10,
                  padding: "12px 22px",
                  cursor: "pointer",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <Home size={15} /> Back home
              </button>
            </Link>
            <button
              onClick={() => navigate(-1)}
              style={{
                flex: "1 1 auto",
                maxWidth: 220,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontSize: 14,
                fontWeight: 500,
                color: "rgba(255,255,255,0.7)",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                padding: "12px 22px",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.09)";
                e.currentTarget.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.color = "rgba(255,255,255,0.7)";
              }}
            >
              <ArrowLeft size={15} /> Go back
            </button>
          </div>

          {/* quick links */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              paddingTop: 24,
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.3)",
                margin: "0 0 14px",
              }}
            >
              Popular destinations
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {QUICK_LINKS.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 13,
                    color: "rgba(255,255,255,0.6)",
                    textDecoration: "none",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 99,
                    padding: "7px 14px",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#fff";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  }}
                >
                  {l.label} <ArrowRight size={12} />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
