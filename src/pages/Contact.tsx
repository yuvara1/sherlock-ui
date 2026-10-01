import { useState, useRef } from "react"
import { Link, useNavigate } from "react-router"
import { motion, useInView, AnimatePresence } from "motion/react"
import {
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Clock,
  Users,
} from "lucide-react"
import { Aurora } from "@/components/ui/Aurora"
import { GridBackground } from "@/components/ui/GridBackground"
import { BorderBeam } from "@/components/ui/BorderBeam"
import { MovingBorderBtn } from "@/components/ui/MovingBorderBtn"
import { GlowCard } from "@/components/ui/GlowCard"
import {
  Navbar,
  NavBody,
  NavItems,
  NavbarButton,
  MobileNav,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar"
const NAV_ITEMS = [
  { name: "Features", link: "/#features" },
  { name: "How it works", link: "/#how-it-works" },
  { name: "Customers", link: "/#testimonials" },
  { name: "Pricing", link: "/#pricing" },
  { name: "Contact", link: "/contact" },
]
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
]
const TESTIMONIAL = {
  quote:
    "We reduced our mean time to resolution by 68% in the first month. The AI-powered root cause analysis alone is worth the price.",
  name: "Manu Arora",
  title: "CEO of Acetell",
  initials: "MA",
}
function AuthInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
}: {
  label: string
  type?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="[display:flex] [flex-direction:column] [gap:6px]">
      <label className="[font-size:13px] [font-weight:500] [color:#ededed] [letter-spacing:-0.004em]">
        {label}
        {required && (
          <span className="[color:#3291ff] [margin-left:2px]">*</span>
        )}
      </label>
      <div className="[position:relative]">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            border: `1px solid ${
              focused ? "rgba(50,145,255,0.6)" : "rgba(255,255,255,0.08)"
            }`,
          }}
          className={[
            "[width:100%] [padding:10px_14px] [background:rgba(255,255,255,0.04)] [border-radius:10px] [color:#ededed] [font-size:13px] [font-family:Geist,_sans-serif] [letter-spacing:-0.004em] [outline:none] [transition:border-color_0.15s]",
            focused
              ? "[box-shadow:0_0_0_3px_rgba(50,145,255,0.12)]"
              : "[box-shadow:none]",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </div>
    </div>
  )
}
export default function Contact() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
    type: "general",
  })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const formRef = useRef<HTMLDivElement>(null)
  const inView = useInView(formRef, { once: true, amount: 0.2 })
  const navigate = useNavigate()
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setSubmitted(true)
    }, 1400)
  }
  const Logo = (
    <Link
      to="/"
      className="[display:flex] [align-items:center] [gap:8px] [text-decoration:none]"
    >
      <div className="[width:28px] [height:28px] [border-radius:7px] [background:linear-gradient(135deg,#0070f3,#7c3aed)] [display:flex] [align-items:center] [justify-content:center]">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M8 1L15 14H1L8 1Z" fill="white" />
        </svg>
      </div>
      <span className="[font-weight:700] [font-size:15px] [color:#fff] [letter-spacing:-0.02em]">
        Sherlock
      </span>
    </Link>
  )
  return (
    <div className="dark [background:#000] [color:#fff] [min-height:100vh] [font-family:Geist,_sans-serif]">
      {/* Navbar */}
      <Navbar>
        <NavBody className="hidden md:flex">
          {Logo}
          <NavItems items={NAV_ITEMS} className="mx-auto" />
          <div className="[display:flex] [align-items:center] [gap:8px]">
            <NavbarButton href="/login" as="a" variant="secondary">
              Sign in
            </NavbarButton>
            <NavbarButton
              onClick={() => navigate("/register")}
              variant="primary"
            >
              Get started free
            </NavbarButton>
          </div>
        </NavBody>
        <MobileNav>
          <MobileNavHeader>
            {Logo}
            <MobileNavToggle
              isOpen={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            />
          </MobileNavHeader>
        </MobileNav>
        <MobileNavMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.name}
              href={item.link}
              className="[display:block] [padding:14px_0] [font-size:16px] [font-weight:500] [color:rgba(255,255,255,0.65)] [text-decoration:none] [border-bottom:1px_solid_rgba(255,255,255,0.05)]"
            >
              {item.name}
            </a>
          ))}
          <div className="[display:flex] [flex-direction:column] [gap:10px] [padding-top:16px]">
            <NavbarButton
              href="/login"
              as="a"
              variant="secondary"
              className="w-full justify-center"
            >
              Sign in
            </NavbarButton>
            <NavbarButton
              onClick={() => navigate("/register")}
              variant="primary"
              className="w-full justify-center"
            >
              Get started free
            </NavbarButton>
          </div>
        </MobileNavMenu>
      </Navbar>

      {/* Hero */}
      <section className="[position:relative] [padding-top:140px] [padding-bottom:80px] [overflow:hidden]">
        <Aurora className="absolute inset-0" intensity="low" />
        <GridBackground dots className="absolute inset-0 opacity-20" />
        <div className="[max-width:720px] [margin:0_auto] [padding:0_24px] [text-align:center] [position:relative] [z-index:10]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="[display:inline-flex] [align-items:center] [gap:6px] [font-size:11px] [font-weight:600] [letter-spacing:0.08em] [text-transform:uppercase] [color:#3291ff] [background:rgba(50,145,255,0.1)] [border:1px_solid_rgba(50,145,255,0.2)] [border-radius:9999px] [padding:5px_14px] [margin-bottom:24px]">
              <Mail size={11} /> Get in touch
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="[font-size:clamp(40px,6vw,64px)] [font-weight:700] [letter-spacing:-0.03em] [line-height:1.08] [margin-bottom:20px]"
          >
            We"re here to help
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="[font-size:17px] [color:rgba(255,255,255,0.45)] [letter-spacing:-0.008em] [line-height:1.7] [max-width:500px] [margin:0_auto]"
          >
            {
              "Whether you're evaluating, scaling, or need hands-on support — our team responds within one business day."
            }
          </motion.p>
        </div>
      </section>

      {/* Support options row */}
      <section className="[max-width:1100px] [margin:0_auto] [padding:0_24px_80px]">
        <div className="[display:grid] [grid-template-columns:repeat(auto-fit,_minmax(280px,_1fr))] [gap:16px]">
          {SUPPORT_OPTIONS.map((opt, i) => (
            <motion.div
              key={opt.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 + i * 0.08 }}
            >
              <GlowCard className="[padding:28px] [height:100%] [background:rgba(255,255,255,0.025)] [border:1px_solid_rgba(255,255,255,0.07)] [border-radius:16px]">
                <div
                  style={{
                    background: `${opt.color}22`,
                    border: `1px solid ${opt.color}44`,
                    color: opt.color,
                  }}
                  className="[width:40px] [height:40px] [border-radius:10px] [display:flex] [align-items:center] [justify-content:center] [margin-bottom:16px]"
                >
                  {opt.icon}
                </div>
                <h3 className="[font-size:15px] [font-weight:600] [letter-spacing:-0.01em] [margin-bottom:8px]">
                  {opt.title}
                </h3>
                <p className="[font-size:13px] [color:rgba(255,255,255,0.42)] [line-height:1.6] [margin-bottom:20px]">
                  {opt.desc}
                </p>
                <button
                  style={{
                    color: opt.color,
                  }}
                  className="[display:inline-flex] [align-items:center] [gap:6px] [font-size:12px] [font-weight:500] [background:none] [border:none] [cursor:pointer] [padding:0] [letter-spacing:-0.003em]"
                >
                  {opt.cta} <ArrowRight size={13} />
                </button>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Main two-col: form + info */}
      <section className="[max-width:1100px] [margin:0_auto] [padding:0_24px_120px]">
        <div
          ref={formRef}
          className="min-w-0 max-[640px]:grid-cols-1 max-[640px]:gap-6 [display:grid] [grid-template-columns:1fr_1fr] [gap:32px] [align-items:start]"
        >
          {/* Left — contact form */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="[position:relative] [border-radius:20px] [overflow:hidden] [border:1px_solid_rgba(255,255,255,0.08)] [background:rgba(255,255,255,0.02)]">
              <BorderBeam
                size={220}
                duration={10}
                colorFrom="#0070f3"
                colorTo="#7c3aed"
              />
              <div className="[padding:40px_36px]">
                <AnimatePresence mode="wait">
                  {submitted ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="[display:flex] [flex-direction:column] [align-items:center] [text-align:center] [padding:40px_0] [gap:16px]"
                    >
                      <div className="[width:56px] [height:56px] [border-radius:50%] [background:rgba(61,214,140,0.1)] [border:1px_solid_rgba(61,214,140,0.3)] [display:flex] [align-items:center] [justify-content:center]">
                        <CheckCircle2 size={26} color="#3dd68c" />
                      </div>
                      <h3 className="[font-size:20px] [font-weight:700] [letter-spacing:-0.02em]">
                        Message sent!
                      </h3>
                      <p className="[font-size:13px] [color:rgba(255,255,255,0.45)] [line-height:1.6] [max-width:300px]">
                        We"ve received your message and will get back to you
                        within one business day.
                      </p>
                      <button
                        onClick={() => {
                          setSubmitted(false)
                          setForm({
                            name: "",
                            email: "",
                            company: "",
                            message: "",
                            type: "general",
                          })
                        }}
                        className="[margin-top:8px] [font-size:13px] [color:#3291ff] [background:none] [border:none] [cursor:pointer] [letter-spacing:-0.004em]"
                      >
                        Send another message
                      </button>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={handleSubmit}
                      className="[display:flex] [flex-direction:column] [gap:20px]"
                    >
                      <div>
                        <h2 className="[font-size:22px] [font-weight:700] [letter-spacing:-0.025em] [margin-bottom:6px]">
                          Contact us
                        </h2>
                        <p className="[font-size:13px] [color:rgba(255,255,255,0.38)] [letter-spacing:-0.004em]">
                          We"re here to help. Email us at{" "}
                          <a
                            href="mailto:hello@apexmonitor.io"
                            className="[color:#3291ff] [text-decoration:underline]"
                          >
                            hello@apexmonitor.io
                          </a>
                          .
                        </p>
                      </div>

                      {/* Inquiry type */}
                      <div className="[display:flex] [flex-direction:column] [gap:6px]">
                        <label className="[font-size:13px] [font-weight:500] [color:#ededed]">
                          Inquiry type
                        </label>
                        <div className="[display:flex] [gap:8px] [flex-wrap:wrap]">
                          {["General", "Sales", "Support", "Partnership"].map(
                            (t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() =>
                                  setForm((f) => ({
                                    ...f,
                                    type: t.toLowerCase(),
                                  }))
                                }
                                className={[
                                  "[font-size:12px] [font-weight:500] [padding:6px_14px] [border-radius:9999px] [cursor:pointer] [transition:all_0.15s]",
                                  form.type === t.toLowerCase()
                                    ? "[border:1px_solid_rgba(50,145,255,0.6)]"
                                    : "[border:1px_solid_rgba(255,255,255,0.08)]",
                                  form.type === t.toLowerCase()
                                    ? "[background:rgba(50,145,255,0.12)]"
                                    : "[background:rgba(255,255,255,0.03)]",
                                  form.type === t.toLowerCase()
                                    ? "[color:#3291ff]"
                                    : "[color:rgba(255,255,255,0.5)]",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              >
                                {t}
                              </button>
                            ),
                          )}
                        </div>
                      </div>

                      <div className="min-w-0 max-[640px]:grid-cols-1 [display:grid] [grid-template-columns:1fr_1fr] [gap:14px]">
                        <AuthInput
                          label="Name"
                          placeholder="Alison Burgers"
                          value={form.name}
                          onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                          required
                        />
                        <AuthInput
                          label="Company"
                          placeholder="Acme Inc."
                          value={form.company}
                          onChange={(v) =>
                            setForm((f) => ({ ...f, company: v }))
                          }
                        />
                      </div>
                      <AuthInput
                        label="Email"
                        type="email"
                        placeholder="you@company.com"
                        value={form.email}
                        onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                        required
                      />

                      {/* Message */}
                      <div className="[display:flex] [flex-direction:column] [gap:6px]">
                        <label className="[font-size:13px] [font-weight:500] [color:#ededed]">
                          Message <span className="[color:#3291ff]">*</span>
                        </label>
                        <textarea
                          placeholder="How can we help you?"
                          value={form.message}
                          required
                          onChange={(e) =>
                            setForm((f) => ({ ...f, message: e.target.value }))
                          }
                          rows={5}
                          onFocus={(e) => {
                            e.target.style.borderColor = "rgba(50,145,255,0.6)"
                            e.target.style.boxShadow =
                              "0 0 0 3px rgba(50,145,255,0.12)"
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor =
                              "rgba(255,255,255,0.08)"
                            e.target.style.boxShadow = "none"
                          }}
                          className="[width:100%] [padding:10px_14px] [background:rgba(255,255,255,0.04)] [border:1px_solid_rgba(255,255,255,0.08)] [border-radius:10px] [color:#ededed] [font-size:13px] [font-family:Geist,_sans-serif] [letter-spacing:-0.004em] [outline:none] [resize:vertical] [line-height:1.6]"
                        />
                      </div>

                      <MovingBorderBtn type="submit" disabled={sending}>
                        {sending ? (
                          <span className="[display:flex] [align-items:center] [gap:8px]">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              className="[animation:spin_0.7s_linear_infinite]"
                            >
                              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                            </svg>
                            Sending…
                          </span>
                        ) : (
                          <span className="[display:flex] [align-items:center] [gap:8px]">
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
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="[display:flex] [flex-direction:column] [gap:28px]"
          >
            {/* Testimonial card */}
            <div className="[position:relative] [border-radius:20px] [overflow:hidden] [background:linear-gradient(135deg,_rgba(0,112,243,0.12)_0%,_rgba(124,58,237,0.08)_100%)] [border:1px_solid_rgba(255,255,255,0.07)] [padding:32px_28px]">
              {/* Landscape illustration strip */}
              <div className="[height:140px] [border-radius:12px] [margin-bottom:24px] [overflow:hidden] [background:linear-gradient(180deg,_#0a1a2e_0%,_#0d2b1e_40%,_#1a3a20_70%,_#2d5a28_100%)] [position:relative]">
                {/* Layered mountain silhouettes */}
                <svg
                  viewBox="0 0 400 140"
                  preserveAspectRatio="xMidYMid slice"
                  className="[width:100%] [height:100%] [position:absolute] [inset:0]"
                >
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
                      <stop
                        offset="50%"
                        stopColor="#06b6d4"
                        stopOpacity="0.5"
                      />
                      <stop
                        offset="100%"
                        stopColor="#0070f3"
                        stopOpacity="0.3"
                      />
                    </linearGradient>
                  </defs>
                  <rect width="400" height="140" fill="url(#sky)" />
                  {/* Far mountains */}
                  <path
                    d="M0 100 L40 50 L80 70 L120 30 L160 60 L200 20 L240 55 L280 35 L320 65 L360 40 L400 70 L400 140 L0 140Z"
                    fill="url(#mtn1)"
                    opacity="0.7"
                  />
                  {/* Near mountains */}
                  <path
                    d="M0 130 L50 80 L100 100 L150 60 L200 85 L250 55 L300 80 L350 70 L400 90 L400 140 L0 140Z"
                    fill="url(#mtn2)"
                  />
                  {/* River */}
                  <path
                    d="M160 140 Q180 120 200 110 Q220 100 230 140"
                    fill="url(#river)"
                  />
                  {/* Stars */}
                  {[30, 80, 150, 220, 300, 360, 15, 120, 250, 380].map(
                    (x, i) => (
                      <circle
                        key={i}
                        cx={x}
                        cy={10 + (i % 3) * 8}
                        r="0.8"
                        fill="white"
                        opacity={0.4 + (i % 3) * 0.2}
                      />
                    ),
                  )}
                </svg>
              </div>

              {/* Quote */}
              <div className="[position:relative]">
                <span className="[font-size:52px] [line-height:1] [color:rgba(50,145,255,0.18)] [font-family:Georgia,_serif] [position:absolute] [top:-8px] [left:-4px]">
                  "
                </span>
                <p className="[font-size:14px] [line-height:1.7] [color:rgba(255,255,255,0.7)] [letter-spacing:-0.005em] [padding-left:20px] [padding-top:12px]">
                  {TESTIMONIAL.quote}
                </p>
                <div className="[display:flex] [align-items:center] [gap:12px] [margin-top:20px]">
                  <div className="[width:36px] [height:36px] [border-radius:50%] [background:rgba(0,112,243,0.25)] [border:1px_solid_rgba(0,112,243,0.4)] [display:flex] [align-items:center] [justify-content:center] [font-size:11px] [font-weight:700] [color:#60a5fa] [font-family:Geist_Mono,_monospace]">
                    {TESTIMONIAL.initials}
                  </div>
                  <div>
                    <p className="[font-size:13px] [font-weight:600] [color:#ededed] [letter-spacing:-0.006em]">
                      {TESTIMONIAL.name}
                    </p>
                    <p className="[font-size:12px] [color:rgba(255,255,255,0.35)] [margin-top:1px]">
                      {TESTIMONIAL.title}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact details */}
            <div className="[display:flex] [flex-direction:column] [gap:14px]">
              {[
                {
                  icon: <Mail size={15} />,
                  label: "Email",
                  value: "hello@apexmonitor.io",
                  href: "mailto:hello@apexmonitor.io",
                },
                {
                  icon: <Phone size={15} />,
                  label: "Phone",
                  value: "+1 (555) 000-0000",
                  href: "tel:+15550000000",
                },
                {
                  icon: <MapPin size={15} />,
                  label: "Office",
                  value: "340 Pine St, San Francisco, CA 94104",
                  href: "#",
                },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="[text-decoration:none] [display:flex] [align-items:flex-start] [gap:14px] [padding:16px_18px] [border-radius:12px] [background:rgba(255,255,255,0.025)] [border:1px_solid_rgba(255,255,255,0.06)] [transition:border-color_0.15s] hover:[border-color:rgba(255,255,255,0.12)]"
                >
                  <div className="[width:32px] [height:32px] [border-radius:8px] [background:rgba(50,145,255,0.1)] [border:1px_solid_rgba(50,145,255,0.2)] [display:flex] [align-items:center] [justify-content:center] [color:#3291ff] [flex-shrink:0]">
                    {item.icon}
                  </div>
                  <div>
                    <p className="[font-size:11px] [color:rgba(255,255,255,0.3)] [margin-bottom:2px] [letter-spacing:0.04em] [text-transform:uppercase]">
                      {item.label}
                    </p>
                    <p className="[font-size:13px] [color:#ededed] [letter-spacing:-0.004em]">
                      {item.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* Response time badge */}
            <div className="[display:flex] [align-items:center] [gap:10px] [padding:14px_18px] [border-radius:12px] [background:rgba(61,214,140,0.06)] [border:1px_solid_rgba(61,214,140,0.15)]">
              <div className="animate-[pulse-dot_2s_ease-in-out_infinite] [width:8px] [height:8px] [border-radius:50%] [background:#3dd68c] [box-shadow:0_0_8px_#3dd68c]" />
              <p className="[font-size:13px] [color:rgba(255,255,255,0.55)] [letter-spacing:-0.004em]">
                Average response time:{" "}
                <span className="[color:#3dd68c] [font-weight:600]">
                  under 4 hours
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="[border-top:1px_solid_rgba(255,255,255,0.06)] [padding:32px_24px] [max-width:1100px] [margin:0_auto] [display:flex] [align-items:center] [justify-content:space-between] [flex-wrap:wrap] [gap:12px]">
        <p className="[font-size:12px] [color:rgba(255,255,255,0.28)] [letter-spacing:-0.003em]">
          © 2026 Sherlock, Inc.
        </p>
        <div className="[display:flex] [gap:24px]">
          {["Privacy", "Terms", "Security"].map((l) => (
            <a
              key={l}
              href="#"
              className="[font-size:12px] [color:rgba(255,255,255,0.28)] [text-decoration:none] [letter-spacing:-0.003em]"
            >
              {l}
            </a>
          ))}
        </div>
      </footer>
    </div>
  )
}
