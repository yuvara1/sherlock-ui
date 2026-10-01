import { useState, useCallback, useId } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { NavbarLogo } from "@/components/ui/resizable-navbar"
import { motion, AnimatePresence } from "motion/react"
import {
  Eye,
  EyeOff,
  AlertCircle,
  Check,
  X,
  ArrowRight,
  Mail,
  Building2,
} from "lucide-react"
import { registerSchema, getPasswordStrength } from "@/schemas/auth"
import { useAuthStore } from "@/stores/authStore"
import axios from "axios"
import { authApi, authErrorMessage } from "@/api/auth"
// ── Input field ─────────────────────────────────────────────────────────────
function Field({
  label,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  autoComplete,
  suffix,
  prefix,
}: {
  label: string
  type?: string
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  error?: string
  placeholder?: string
  autoComplete?: string
  suffix?: React.ReactNode
  prefix?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  const fieldId = useId()
  return (
    <div className="[display:flex] [flex-direction:column] [gap:6px]">
      <label htmlFor={fieldId} className="[font-size:13px] [font-weight:500] [color:rgba(255,255,255,0.75)] [letter-spacing:-0.002em]">
        {label}
      </label>
      <div className="[position:relative]">
        {prefix && (
          <div className="[position:absolute] [left:12px] [top:50%] [transform:translateY(-50%)] [color:rgba(255,255,255,0.25)] [pointer-events:none]">
            {prefix}
          </div>
        )}
        <input
          id={fieldId}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false)
            onBlur?.()
          }}
          style={{
            padding: `11px ${suffix ? "42px" : "14px"} 11px ${
              prefix ? "38px" : "14px"
            }`,
            border: `1px solid ${
              error
                ? "rgba(239,68,68,0.6)"
                : focused
                  ? "rgba(255,255,255,0.2)"
                  : "rgba(255,255,255,0.08)"
            }`,
          }}
          className="[width:100%] [background:#1a1a1a] [border-radius:10px] [color:#fff] [font-size:14px] [font-family:Geist,_sans-serif] [outline:none] [letter-spacing:-0.004em] [transition:border-color_0.15s] [box-sizing:border-box]"
        />
        {suffix && (
          <div className="[position:absolute] [right:12px] [top:50%] [transform:translateY(-50%)]">
            {suffix}
          </div>
        )}
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="[font-size:12px] [color:#ef4444] [display:flex] [align-items:center] [gap:4px] [margin:0]"
          >
            <AlertCircle size={11} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
// ── Password strength ───────────────────────────────────────────────────────
function StrengthMeter({ password }: { password: string }) {
  const { score, label, color, checks } = getPasswordStrength(password)
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="[overflow:hidden]"
    >
      <div className="[padding-top:8px] [display:flex] [flex-direction:column] [gap:8px]">
        <div className="[display:flex] [align-items:center] [gap:8px]">
          <div className="[flex:1] [display:flex] [gap:3px]">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  background: i < score ? color : "rgba(255,255,255,0.08)",
                }}
                className="[flex:1] [height:3px] [border-radius:99px] [transition:background_0.3s]"
              />
            ))}
          </div>
          <span
            style={{
              color,
            }}
            className="[font-size:11px] [font-weight:600] [min-width:52px] [text-align:right]"
          >
            {label}
          </span>
        </div>
        <div className="[display:grid] [grid-template-columns:1fr_1fr] [gap:3px_10px]">
          {checks.map((c) => (
            <div
              key={c.label}
              className="[display:flex] [align-items:center] [gap:5px]"
            >
              <div
                style={{
                  border: `1px solid ${
                    c.passed
                      ? "rgba(255,255,255,0.2)"
                      : "rgba(255,255,255,0.08)"
                  }`,
                }}
                className={[
                  "[width:12px] [height:12px] [border-radius:50%] [flex-shrink:0] [display:flex] [align-items:center] [justify-content:center] [transition:all_0.2s]",
                  c.passed
                    ? "[background:rgba(255,255,255,0.08)]"
                    : "[background:rgba(255,255,255,0.03)]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {c.passed ? (
                  <Check
                    size={7}
                    color="rgba(255,255,255,0.8)"
                    strokeWidth={3}
                  />
                ) : (
                  <X size={7} color="rgba(255,255,255,0.2)" strokeWidth={3} />
                )}
              </div>
              <span
                className={[
                  "[font-size:11px]",
                  c.passed
                    ? "[color:rgba(255,255,255,0.5)]"
                    : "[color:rgba(255,255,255,0.2)]",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {c.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
// ── Verify screen ───────────────────────────────────────────────────────────
function VerifyScreen({ email }: { email: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="[display:flex] [flex-direction:column] [align-items:center] [text-align:center] [gap:20px]"
    >
      <div className="[justify-content:center] [display:flex] [margin-bottom:4px]">
        <NavbarLogo />
      </div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.15, type: "spring", stiffness: 220 }}
        className="[width:64px] [height:64px] [border-radius:18px] [background:rgba(255,255,255,0.06)] [border:1px_solid_rgba(255,255,255,0.12)] [display:flex] [align-items:center] [justify-content:center]"
      >
        <Mail size={28} color="rgba(255,255,255,0.7)" />
      </motion.div>
      <div>
        <h2 className="[font-size:20px] [font-weight:700] [color:#fff] [letter-spacing:-0.025em] [margin-bottom:8px]">
          Check your inbox
        </h2>
        <p className="[font-size:14px] [color:rgba(255,255,255,0.4)] [line-height:1.6] [max-width:300px]">
          {"We've sent a verification link to "}
          <strong className="[color:rgba(255,255,255,0.65)]">{email}</strong>.
        </p>
      </div>
      <Link
        to="/login?registered=1"
        className="[width:100%] [padding:12px] [border-radius:10px] [background:#fff] [color:#000] [text-decoration:none] [font-size:14px] [font-weight:600] [display:flex] [align-items:center] [justify-content:center] [gap:8px] [font-family:Geist,_sans-serif]"
      >
        Go to sign in <ArrowRight size={14} />
      </Link>
      <button
        type="button"
        className="[font-size:13px] [color:rgba(255,255,255,0.3)] [background:none] [border:none] [cursor:pointer]"
      >
        {"Didn't receive it? Resend"}
      </button>
    </motion.div>
  )
}
// ── Step dots ───────────────────────────────────────────────────────────────
function StepDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="[display:flex] [gap:5px] [justify-content:center] [margin-bottom:24px]">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={[
            "[height:3px] [border-radius:99px] [transition:all_0.3s]",
            i <= current
              ? "[background:#fff]"
              : "[background:rgba(255,255,255,0.12)]",
            i === current ? "[width:22px]" : "[width:7px]",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      ))}
    </div>
  )
}
// ── Shared styles ───────────────────────────────────────────────────────────
const btnWhite: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  background: "#fff",
  color: "#000",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "Geist, sans-serif",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  transition: "opacity 0.15s",
}
const btnOutline: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  borderRadius: 10,
  cursor: "pointer",
  background: "#fff",
  color: "#000",
  fontSize: 14,
  fontWeight: 500,
  fontFamily: "Geist, sans-serif",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  border: "1px solid rgba(255,255,255,0.15)",
  transition: "opacity 0.15s",
}
// ── Main Register ───────────────────────────────────────────────────────────
type Step = "account" | "password" | "verify"
export default function Register() {
  const [params] = useSearchParams()
  const { setVerificationSent, login } = useAuthStore()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>("account")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [orgName, setOrgName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [duplicateEmail, setDuplicateEmail] = useState(false)
  const touch = (f: string) => setTouched((prev) => new Set(prev).add(f))
  const validateField = useCallback(
    (field: string, val: string | boolean) => {
      const partial = {
        name,
        email,
        organizationName: orgName,
        password,
        confirmPassword,
        acceptTerms,
        [field === "orgName" ? "organizationName" : field]: val,
      }
      const result = registerSchema.safeParse(partial)
      const fe = result.success
        ? {}
        : result.error.flatten().fieldErrors as Record<string, string[]>
      const fieldKey = field === "orgName" ? "organizationName" : field
      setErrors((prev) => {
        const n = { ...prev }
        const msg = fe[fieldKey]?.[0]
        if (msg) n[field] = msg
        else delete n[field]
        return n
      })
    },
    [name, email, orgName, password, confirmPassword, acceptTerms],
  )
  const blurField = (field: string, val: string | boolean) => {
    touch(field)
    validateField(field, val)
  }
  const checkDuplicate = (val: string) => {
    if (val === "taken@sherlock.dev") {
      setDuplicateEmail(true)
      setErrors((p) => ({
        ...p,
        email: "An account with this email already exists",
      }))
    } else {
      setDuplicateEmail(false)
      setErrors((p) => {
        const n = { ...p }
        if (n.email === "An account with this email already exists")
          delete n.email
        return n
      })
    }
  }
  const submitStep1 = (e: React.FormEvent) => {
    e.preventDefault()
    ;["name", "email", "orgName"].forEach((f) => touch(f))
    validateField("name", name)
    validateField("email", email)
    validateField("orgName", orgName)
    if (
      !name ||
      !email ||
      !orgName ||
      errors.name ||
      errors.email ||
      errors.orgName ||
      duplicateEmail
    )
      return
    setStep("password")
  }
  const submitStep2 = async (e: React.FormEvent) => {
    e.preventDefault()
    ;["password", "confirmPassword", "acceptTerms"].forEach((f) => touch(f))
    validateField("password", password)
    validateField("confirmPassword", confirmPassword)
    if (
      !password ||
      !confirmPassword ||
      password !== confirmPassword ||
      !acceptTerms ||
      errors.password ||
      errors.confirmPassword
    )
      return
    const { score } = getPasswordStrength(password)
    if (score < 3) {
      setErrors((p) => ({
        ...p,
        password: "Password is too weak — aim for Good or Strong",
      }))
      return
    }
    setLoading(true)
    try {
      const res = await authApi.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        organizationName: orgName.trim(),
      })
      login(res.user, res.tokens, false)
      setVerificationSent(email)
      setLoading(false)
      setStep("verify")
      const returnTo = params.get("returnTo")
      const destination =
        returnTo &&
        returnTo.startsWith("/") &&
        !returnTo.startsWith("//") &&
        !returnTo.includes("\\")
          ? returnTo
          : "/app/projects"
      setTimeout(() => navigate(destination, { replace: true }), 1800)
    } catch (err) {
      setLoading(false)
      if (axios.isAxiosError(err) && err.response?.status === 409) {
        setDuplicateEmail(true)
        setStep("account")
        return
      }
      setErrors((p) => ({ ...p, password: authErrorMessage(err) }))
    }
  }
  return (
    <div className="[min-height:100vh] [background:#000] [display:flex] [flex-direction:column] [align-items:center] [justify-content:center] [font-family:Geist,_sans-serif] [padding:40px_20px]">
      <div className="[width:100%] [max-width:360px]">
        <AnimatePresence mode="wait">
          {/* ── Step 1: Account ── */}
          {step === "account" && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="[display:flex] [justify-content:center] [margin-bottom:28px]">
                <NavbarLogo />
              </div>
              <StepDots current={0} total={3} />
              <h1 className="[font-size:22px] [font-weight:700] [color:#fff] [text-align:center] [letter-spacing:-0.025em] [margin-bottom:6px]">
                Create your account
              </h1>
              <p className="[font-size:14px] [color:rgba(255,255,255,0.4)] [text-align:center] [line-height:1.5] [margin-bottom:28px] [letter-spacing:-0.003em]">
                Join 2,000+ engineering teams using Sherlock.
              </p>

              <form
                onSubmit={submitStep1}
                className="[display:flex] [flex-direction:column] [gap:14px]"
              >
                <Field
                  label="Full name"
                  value={name}
                  onChange={(v) => {
                    setName(v)
                    if (touched.has("name")) validateField("name", v)
                  }}
                  onBlur={() => blurField("name", name)}
                  error={touched.has("name") ? errors.name : undefined}
                  placeholder="Sarah Kim"
                  autoComplete="name"
                />
                <Field
                  label="Work email"
                  type="email"
                  value={email}
                  onChange={(v) => {
                    setEmail(v)
                    setDuplicateEmail(false)
                    if (touched.has("email")) validateField("email", v)
                  }}
                  onBlur={() => {
                    blurField("email", email)
                    checkDuplicate(email)
                  }}
                  error={touched.has("email") ? errors.email : undefined}
                  placeholder="you@company.com"
                  autoComplete="email"
                />
                <Field
                  label="Organization"
                  value={orgName}
                  onChange={(v) => {
                    setOrgName(v)
                    if (touched.has("orgName")) validateField("orgName", v)
                  }}
                  onBlur={() => blurField("orgName", orgName)}
                  error={touched.has("orgName") ? errors.orgName : undefined}
                  placeholder="Acme Inc."
                  autoComplete="organization"
                  prefix={<Building2 size={14} />}
                />
                <button
                  type="submit"
                  className="[width:100%] [padding:12px] [border-radius:10px] [border:none] [cursor:pointer] [background:#fff] [color:#000] [font-size:14px] [font-weight:600] [font-family:Geist,_sans-serif] [display:flex] [align-items:center] [justify-content:center] [gap:8px] [transition:opacity_0.15s]"
                >
                  Continue <ArrowRight size={14} />
                </button>
              </form>

              <div className="[display:flex] [align-items:center] [gap:10px] [margin:20px_0]">
                <div className="[flex:1] [border-top:1px_dashed_rgba(255,255,255,0.15)]" />
                <span className="[font-size:12px] [color:rgba(255,255,255,0.3)] [letter-spacing:0.06em] [font-weight:500]">
                  OR
                </span>
                <div className="[flex:1] [border-top:1px_dashed_rgba(255,255,255,0.15)]" />
              </div>

              <div className="[display:flex] [flex-direction:column] [gap:10px]">
                <button
                  type="button"
                  className="[width:100%] [padding:12px] [border-radius:10px] [cursor:pointer] [background:#fff] [color:#000] [font-size:14px] [font-weight:500] [font-family:Geist,_sans-serif] [display:flex] [align-items:center] [justify-content:center] [gap:10px] [border:1px_solid_rgba(255,255,255,0.15)] [transition:opacity_0.15s] hover:[opacity:0.85]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continue with Google
                </button>
                <button
                  type="button"
                  className="[width:100%] [padding:12px] [border-radius:10px] [cursor:pointer] [background:#fff] [color:#000] [font-size:14px] [font-weight:500] [font-family:Geist,_sans-serif] [display:flex] [align-items:center] [justify-content:center] [gap:10px] [border:1px_solid_rgba(255,255,255,0.15)] [transition:opacity_0.15s] hover:[opacity:0.85]"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#000">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  Continue with Apple
                </button>
              </div>

              <p className="[text-align:center] [margin-top:24px] [font-size:14px] [color:rgba(255,255,255,0.35)] [letter-spacing:-0.002em]">
                Already have an account?{" "}
                <Link
                  to={`/login${
                    params.get("returnTo")
                      ? `?returnTo=${encodeURIComponent(params.get("returnTo")!)}`
                      : ""
                  }`}
                  className="[color:#fff] [font-weight:700] [text-decoration:none]"
                >
                  Sign in
                </Link>
              </p>
            </motion.div>
          )}

          {/* ── Step 2: Password ── */}
          {step === "password" && (
            <motion.div
              key="password"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="[display:flex] [justify-content:center] [margin-bottom:28px]">
                <NavbarLogo />
              </div>
              <StepDots current={1} total={3} />
              <h2 className="[font-size:22px] [font-weight:700] [color:#fff] [text-align:center] [letter-spacing:-0.025em] [margin-bottom:6px]">
                Secure your account
              </h2>
              <p className="[font-size:14px] [color:rgba(255,255,255,0.4)] [text-align:center] [line-height:1.5] [margin-bottom:28px]">
                Creating a strong password for{" "}
                <span className="[color:rgba(255,255,255,0.65)]">{email}</span>
              </p>

              <form
                onSubmit={submitStep2}
                className="[display:flex] [flex-direction:column] [gap:14px]"
              >
                <div>
                  <Field
                    label="Password"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(v) => {
                      setPassword(v)
                      if (touched.has("password")) validateField("password", v)
                    }}
                    onBlur={() => blurField("password", password)}
                    error={
                      touched.has("password") ? errors.password : undefined
                    }
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="[background:none] [border:none] [cursor:pointer] [color:rgba(255,255,255,0.3)] [display:flex] [align-items:center] [padding:0] hover:[color:rgba(255,255,255,0.7)]"
                      >
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    }
                  />
                  <AnimatePresence>
                    {password && <StrengthMeter password={password} />}
                  </AnimatePresence>
                </div>
                <Field
                  label="Confirm password"
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(v) => {
                    setConfirmPassword(v)
                    if (touched.has("confirmPassword"))
                      validateField("confirmPassword", v)
                  }}
                  onBlur={() => blurField("confirmPassword", confirmPassword)}
                  error={
                    touched.has("confirmPassword")
                      ? errors.confirmPassword
                      : undefined
                  }
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  suffix={
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="[background:none] [border:none] [cursor:pointer] [color:rgba(255,255,255,0.3)] [display:flex] [padding:0] hover:[color:rgba(255,255,255,0.7)]"
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  }
                />

                <label className="[display:flex] [align-items:flex-start] [gap:10px] [cursor:pointer]">
                  <div className="[position:relative] [margin-top:1px] [flex-shrink:0]">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => {
                        setAcceptTerms(e.target.checked)
                        if (touched.has("acceptTerms"))
                          validateField("acceptTerms", e.target.checked)
                      }}
                      className="[opacity:0] [position:absolute] [inset:0] [cursor:pointer] [margin:0]"
                    />
                    <div
                      style={{
                        border: `1px solid ${
                          acceptTerms
                            ? "rgba(255,255,255,0.4)"
                            : "rgba(255,255,255,0.15)"
                        }`,
                      }}
                      className={[
                        "[width:16px] [height:16px] [border-radius:4px] [display:flex] [align-items:center] [justify-content:center] [transition:all_0.15s]",
                        acceptTerms
                          ? "[background:rgba(255,255,255,0.1)]"
                          : "[background:transparent]",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {acceptTerms && (
                        <Check size={10} color="#fff" strokeWidth={3} />
                      )}
                    </div>
                  </div>
                  <span className="[font-size:13px] [color:rgba(255,255,255,0.38)] [line-height:1.5]">
                    {"I agree to Sherlock's"}{" "}
                    <a
                      href="#"
                      onClick={(e) => e.stopPropagation()}
                      className="[color:rgba(255,255,255,0.65)] [text-decoration:underline]"
                    >
                      Terms
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      onClick={(e) => e.stopPropagation()}
                      className="[color:rgba(255,255,255,0.65)] [text-decoration:underline]"
                    >
                      Privacy Policy
                    </a>
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className={[
                    [
                      "[margin-top:4px]",
                      loading ? "[opacity:0.5]" : "[opacity:1]",
                      loading ? "[cursor:not-allowed]" : "[cursor:pointer]",
                    ]
                      .filter(Boolean)
                      .join(" "),
                    "[width:100%] [padding:12px] [border-radius:10px] [border:none] [cursor:pointer] [background:#fff] [color:#000] [font-size:14px] [font-weight:600] [font-family:Geist,_sans-serif] [display:flex] [align-items:center] [justify-content:center] [gap:8px] [transition:opacity_0.15s]",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {loading ? (
                    <>
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        className="[animation:spin_0.6s_linear_infinite]"
                      >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Creating account…
                    </>
                  ) : (
                    <>
                      Create account <ArrowRight size={14} />
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setStep("account")}
                  className="[font-size:13px] [color:rgba(255,255,255,0.3)] [background:none] [border:none] [cursor:pointer]"
                >
                  ← Back
                </button>
              </form>
            </motion.div>
          )}

          {/* ── Step 3: Verify ── */}
          {step === "verify" && (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <StepDots current={2} total={3} />
              <VerifyScreen email={email} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
