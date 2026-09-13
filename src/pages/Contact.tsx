import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "motion/react";
import { Mail, MapPin, Phone, ArrowRight, CheckCircle2, MessageSquare, Clock, Users } from "lucide-react";
import { Aurora } from "@/components/ui/Aurora";
import { GridBackground } from "@/components/ui/GridBackground";
import { BorderBeam } from "@/components/ui/BorderBeam";
import { MovingBorderBtn } from "@/components/ui/MovingBorderBtn";
import { GlowCard } from "@/components/ui/GlowCard";
import {
  Navbar, NavBody, NavItems, NavbarButton,
  MobileNav, MobileNavHeader, MobileNavToggle, MobileNavMenu,
} from "@/components/ui/resizable-navbar";

const NAV_ITEMS = [
  { name: "Features",     link: "/#features"      },
  { name: "How it works", link: "/#how-it-works"  },
  { name: "Customers",    link: "/#testimonials"  },
  { name: "Pricing",      link: "/#pricing"       },
  { name: "Contact",      link: "/contact"        },
];

const SUPPORT_OPTIONS = [
  {
    icon: <MessageSquare size={20} />,
    title: "Sales",
    desc: "Talk to our team about plans, pricing, and enterprise options.",
    cta: "Talk to sales",
    color: "#0070f3",
  },
  {
    icon: <Clock size={20} />,
    title: "Support",
    desc: "Get help with your account, integrations, or technical issues.",
    cta: "Open a ticket",
    color: "#7c3aed",
  },
  {
    icon: <Users size={20} />,
    title: "Partnerships",
    desc: "Explore co-sell, reseller, or technology partner programs.",
    cta: "Reach out",
    color: "#06b6d4",
  },
];

const TESTIMONIAL = {
  quote: "We reduced our mean time to resolution by 68% in the first month. The AI-powered root cause analysis alone is worth the price.",
  name: "Manu Arora",
  title: "CEO of Acetell",
  initials: "MA",
};

function AuthInput({
  label, type = "text", placeholder, value, onChange, required = false,
}: {
  label: string; type?: string; placeholder: string; value: string;
  onChange: (v: string) => void; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: "#ededed", letterSpacing: "-0.004em" }}>
        {label}{required && <span style={{ color: "#3291ff", marginLeft: 2 }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          required={required}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%", padding: "10px 14px",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${focused ? "rgba(50,145,255,0.6)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 10, color: "#ededed", fontSize: 13,
            fontFamily: "Geist, sans-serif", letterSpacing: "-0.004em",
            outline: "none", transition: "border-color 0.15s",
            boxShadow: focused ? "0 0 0 3px rgba(50,145,255,0.12)" : "none",
          }}
        />
      </div>
    </div>
  );
}

export default function Contact() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "", type: "general" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const inView = useInView(formRef, { once: true, amount: 0.2 });
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => { setSending(false); setSubmitted(true); }, 1400);
  };

  const Logo = (
    <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
      <div style={{ width: 28, height: 28, borderRadius: 7, background: "linear-gradient(135deg,#0070f3,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1L15 14H1L8 1Z" fill="white" /></svg>
      </div>
      <span style={{ fontWeight: 700, fontSize: 15, color: "#fff", letterSpacing: "-0.02em" }}>Sherlock</span>
    </Link>
  );

  return (
    <div className="dark" style={{ background: "#000", color: "#fff", minHeight: "100vh", fontFamily: "Geist, sans-serif" }}>

      {/* Navbar */}
      <Navbar>
        <NavBody className="hidden md:flex">
          {Logo}
          <NavItems items={NAV_ITEMS} className="mx-auto" />
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <NavbarButton href="/login" as="a" variant="secondary">Sign in</NavbarButton>
            <NavbarButton onClick={() => navigate("/register")} variant="primary">Get started free</NavbarButton>
          </div>
        </NavBody>
        <MobileNav>
          <MobileNavHeader>
            {Logo}
            <MobileNavToggle isOpen={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} />
          </MobileNavHeader>
        </MobileNav>
        <MobileNavMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
          {NAV_ITEMS.map(item => (
            <a key={item.name} href={item.link} style={{
              display: "block", padding: "14px 0", fontSize: 16, fontWeight: 500,
              color: "rgba(255,255,255,0.65)", textDecoration: "none",
              borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
              {item.name}
            </a>
          ))}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 16 }}>
            <NavbarButton href="/login" as="a" variant="secondary" className="w-full justify-center">Sign in</NavbarButton>
            <NavbarButton onClick={() => navigate("/register")} variant="primary" className="w-full justify-center">Get started free</NavbarButton>
          </div>
        </MobileNavMenu>
      </Navbar>

      {/* Hero */}
      <section style={{ position: "relative", paddingTop: 140, paddingBottom: 80, overflow: "hidden" }}>
        <Aurora className="absolute inset-0" intensity="low" />
        <GridBackground dots className="absolute inset-0 opacity-20" />
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px", textAlign: "center", position: "relative", zIndex: 10 }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
              color: "#3291ff", background: "rgba(50,145,255,0.1)", border: "1px solid rgba(50,145,255,0.2)",
              borderRadius: 9999, padding: "5px 14px", marginBottom: 24,
            }}>
              <Mail size={11} /> Get in touch
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
            style={{ fontSize: "clamp(40px,6vw,64px)", fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.08, marginBottom: 20 }}>
            We"re here to help
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.16 }}
            style={{ fontSize: 17, color: "rgba(255,255,255,0.45)", letterSpacing: "-0.008em", lineHeight: 1.7, maxWidth: 500, margin: "0 auto" }}>
            {"Whether you're evaluating, scaling, or need hands-on support — our team responds within one business day."}
          </motion.p>
        </div>
      </section>

      {/* Support options row */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {SUPPORT_OPTIONS.map((opt, i) => (
            <motion.div key={opt.title}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.08 }}>
              <GlowCard style={{ padding: 28, height: "100%", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${opt.color}22`, border: `1px solid ${opt.color}44`, display: "flex", alignItems: "center", justifyContent: "center", color: opt.color, marginBottom: 16 }}>
                  {opt.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", marginBottom: 8 }}>{opt.title}</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.6, marginBottom: 20 }}>{opt.desc}</p>
                <button style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  fontSize: 12, fontWeight: 500, color: opt.color,
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  letterSpacing: "-0.003em",
                }}>
                  {opt.cta} <ArrowRight size={13} />
                </button>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main two-col: form + info */}
      <section style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 120px" }}>
        <div ref={formRef} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, alignItems: "start" }}>

          {/* Left — contact form */}
          <motion.div
            initial={{ opacity: 0, x: -24 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}>
            <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
              <BorderBeam size={220} duration={10} colorFrom="#0070f3" colorTo="#7c3aed" />
              <div style={{ padding: "40px 36px" }}>
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div key="success"
                      initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "40px 0", gap: 16 }}>
                      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(61,214,140,0.1)", border: "1px solid rgba(61,214,140,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CheckCircle2 size={26} color="#3dd68c" />
                      </div>
                      <h3 style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>Message sent!</h3>
                      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, maxWidth: 300 }}>
                        We"ve received your message and will get back to you within one business day.
                      </p>
                      <button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", company: "", message: "", type: "general" }); }}
                        style={{ marginTop: 8, fontSize: 13, color: "#3291ff", background: "none", border: "none", cursor: "pointer", letterSpacing: "-0.004em" }}>
                        Send another message
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form key="form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      <div>
                        <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.025em", marginBottom: 6 }}>Contact us</h2>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", letterSpacing: "-0.004em" }}>
                          We"re here to help. Email us at{" "}
                          <a href="mailto:hello@apexmonitor.io" style={{ color: "#3291ff", textDecoration: "underline" }}>hello@apexmonitor.io</a>.
                        </p>
                      </div>

                      {/* Inquiry type */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: "#ededed" }}>Inquiry type</label>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {["General", "Sales", "Support", "Partnership"].map(t => (
                            <button key={t} type="button"
                              onClick={() => setForm(f => ({ ...f, type: t.toLowerCase() }))}
                              style={{
                                fontSize: 12, fontWeight: 500, padding: "6px 14px", borderRadius: 9999,
                                border: form.type === t.toLowerCase() ? "1px solid rgba(50,145,255,0.6)" : "1px solid rgba(255,255,255,0.08)",
                                background: form.type === t.toLowerCase() ? "rgba(50,145,255,0.12)" : "rgba(255,255,255,0.03)",
                                color: form.type === t.toLowerCase() ? "#3291ff" : "rgba(255,255,255,0.5)",
                                cursor: "pointer", transition: "all 0.15s",
                              }}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                        <AuthInput label="Name" placeholder="Alison Burgers" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} required />
                        <AuthInput label="Company" placeholder="Acme Inc." value={form.company} onChange={v => setForm(f => ({ ...f, company: v }))} />
                      </div>
                      <AuthInput label="Email" type="email" placeholder="you@company.com" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} required />

                      {/* Message */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: "#ededed" }}>
                          Message <span style={{ color: "#3291ff" }}>*</span>
                        </label>
                        <textarea
                          placeholder="How can we help you?"
                          value={form.message}
                          required
                          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                          rows={5}
                          style={{
                            width: "100%", padding: "10px 14px",
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 10, color: "#ededed", fontSize: 13,
                            fontFamily: "Geist, sans-serif", letterSpacing: "-0.004em",
                            outline: "none", resize: "vertical", lineHeight: 1.6,
                          }}
                          onFocus={e => { e.target.style.borderColor = "rgba(50,145,255,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(50,145,255,0.12)"; }}
                          onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                        />
                      </div>

                      <MovingBorderBtn type="submit" disabled={sending}>
                        {sending ? (
                          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ animation: "spin 0.7s linear infinite" }}>
                              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                            Sending…
                          </span>
                        ) : (
                          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            Send message <ArrowRight size={14} />
                          </span>
                        )}
                      </MovingBorderBtn>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Right — info panel */}
          <motion.div
            initial={{ opacity: 0, x: 24 }} animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: "flex", flexDirection: "column", gap: 28 }}>

            {/* Testimonial card */}
            <div style={{
              position: "relative", borderRadius: 20, overflow: "hidden",
              background: "linear-gradient(135deg, rgba(0,112,243,0.12) 0%, rgba(124,58,237,0.08) 100%)",
              border: "1px solid rgba(255,255,255,0.07)", padding: "32px 28px",
            }}>
              {/* Landscape illustration strip */}
              <div style={{
                height: 140, borderRadius: 12, marginBottom: 24, overflow: "hidden",
                background: "linear-gradient(180deg, #0a1a2e 0%, #0d2b1e 40%, #1a3a20 70%, #2d5a28 100%)",
                position: "relative",
              }}>
                {/* Layered mountain silhouettes */}
                <svg viewBox="0 0 400 140" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
                  <defs>
                    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0a1628" />
                      <stop offset="100%" stopColor="#0d2b1e" />
                    </linearGradient>
                    <linearGradient id="mtn1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1a4a30" />
                      <stop offset="100%" stopColor="#0d2b1e" />
                    </linearGradient>
                    <linearGradient id="mtn2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2d6040" />
                      <stop offset="100%" stopColor="#1a3a28" />
                    </linearGradient>
                    <linearGradient id="river" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#0070f3" stopOpacity="0.3" />
                      <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#0070f3" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  <rect width="400" height="140" fill="url(#sky)" />
                  {/* Far mountains */}
                  <path d="M0 100 L40 50 L80 70 L120 30 L160 60 L200 20 L240 55 L280 35 L320 65 L360 40 L400 70 L400 140 L0 140Z" fill="url(#mtn1)" opacity="0.7" />
                  {/* Near mountains */}
                  <path d="M0 130 L50 80 L100 100 L150 60 L200 85 L250 55 L300 80 L350 70 L400 90 L400 140 L0 140Z" fill="url(#mtn2)" />
                  {/* River */}
                  <path d="M160 140 Q180 120 200 110 Q220 100 230 140" fill="url(#river)" />
                  {/* Stars */}
                  {[30,80,150,220,300,360,15,120,250,380].map((x, i) => (
                    <circle key={i} cx={x} cy={10 + (i % 3) * 8} r="0.8" fill="white" opacity={0.4 + (i % 3) * 0.2} />
                  ))}
                </svg>
              </div>

              {/* Quote */}
              <div style={{ position: "relative" }}>
                <span style={{ fontSize: 52, lineHeight: 1, color: "rgba(50,145,255,0.18)", fontFamily: "Georgia, serif", position: "absolute", top: -8, left: -4 }}>"</span>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", letterSpacing: "-0.005em", paddingLeft: 20, paddingTop: 12 }}>
                  {TESTIMONIAL.quote}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 20 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,112,243,0.25)", border: "1px solid rgba(0,112,243,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#60a5fa", fontFamily: "Geist Mono, monospace" }}>
                    {TESTIMONIAL.initials}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#ededed", letterSpacing: "-0.006em" }}>{TESTIMONIAL.name}</p>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{TESTIMONIAL.title}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { icon: <Mail size={15} />, label: "Email", value: "hello@apexmonitor.io", href: "mailto:hello@apexmonitor.io" },
                { icon: <Phone size={15} />, label: "Phone", value: "+1 (555) 000-0000", href: "tel:+15550000000" },
                { icon: <MapPin size={15} />, label: "Office", value: "340 Pine St, San Francisco, CA 94104", href: "#" },
              ].map(item => (
                <a key={item.label} href={item.href} style={{ textDecoration: "none", display: "flex", alignItems: "flex-start", gap: 14, padding: "16px 18px", borderRadius: 12, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", transition: "border-color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(50,145,255,0.1)", border: "1px solid rgba(50,145,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#3291ff", flexShrink: 0 }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 2, letterSpacing: "0.04em", textTransform: "uppercase" }}>{item.label}</p>
                    <p style={{ fontSize: 13, color: "#ededed", letterSpacing: "-0.004em" }}>{item.value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Response time badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderRadius: 12, background: "rgba(61,214,140,0.06)", border: "1px solid rgba(61,214,140,0.15)" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3dd68c", boxShadow: "0 0 8px #3dd68c" }} className="pulse-dot" />
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", letterSpacing: "-0.004em" }}>
                Average response time: <span style={{ color: "#3dd68c", fontWeight: 600 }}>under 4 hours</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 24px", maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", letterSpacing: "-0.003em" }}>© 2026 Sherlock, Inc.</p>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "Security"].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", textDecoration: "none", letterSpacing: "-0.003em" }}>{l}</a>
          ))}
        </div>
      </footer>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
