import { useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { authApi, authErrorMessage } from "@/api/auth"
import { motion, AnimatePresence } from "motion/react"
import {
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Check,
  X,
} from "lucide-react"
import { getPasswordStrength, resetPasswordSchema } from "@/schemas/auth"
function SherlockLogo({ size = 28 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
      }}
      className="[background:linear-gradient(135deg,#3291ff_0%,#7c3aed_100%)] [display:flex] [align-items:center] [justify-content:center] [flex-shrink:0]"
    >
      <svg
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 16 16"
        fill="none"
      >
        <circle cx="8" cy="8" r="3" fill="white" />
        <path
          d="M8 1v2M8 13v2M1 8h2M13 8h2"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
function StrengthMeter({ password }: { password: string }) {
  if (!password) return null
  const { score, label, color, checks } = getPasswordStrength(password)
  return (
    <div className="[padding-top:8px]">
      <div className="[display:flex] [align-items:center] [gap:10px] [margin-bottom:8px]">
        <div className="[flex:1] [display:flex] [gap:4px]">
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
          className="[font-size:11px] [font-weight:600] [letter-spacing:-0.002em] [min-width:60px] [text-align:right]"
        >
          {label}
        </span>
      </div>
      <div className="[display:grid] [grid-template-columns:1fr_1fr] [gap:4px_12px]">
        {checks.map((c) => (
          <div
            key={c.label}
            className="[display:flex] [align-items:center] [gap:5px]"
          >
            <div
              style={{
                border: `1px solid ${
                  c.passed ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.1)"
                }`,
              }}
              className={[
                "[width:13px] [height:13px] [border-radius:50%] [flex-shrink:0] [display:flex] [align-items:center] [justify-content:center] [transition:all_0.2s]",
                c.passed
                  ? "[background:rgba(34,197,94,0.15)]"
                  : "[background:rgba(255,255,255,0.04)]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {c.passed ? (
                <Check size={7} color="#22c55e" strokeWidth={3} />
              ) : (
                <X size={7} color="rgba(255,255,255,0.2)" strokeWidth={3} />
              )}
            </div>
            <span
              className={[
                "[font-size:11px]",
                c.passed
                  ? "[color:rgba(255,255,255,0.5)]"
                  : "[color:rgba(255,255,255,0.22)]",
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
  )
}
export default function ResetPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get("token") ?? ""
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [errors, setErrors] = useState<{
    password?: string
    confirm?: string
  }>({})
  const [touched, setTouched] = useState<Set<string>>(new Set())
  const [focusedPass, setFocusedPass] = useState(false)
  const [focusedConfirm, setFocusedConfirm] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setTouched(new Set(["password", "confirm"]))
    const result = resetPasswordSchema.safeParse({
      password,
      confirmPassword: confirm,
    })
    if (!result.success) {
      const fe = result.error.flatten().fieldErrors
      setErrors({
        password: fe.password?.[0],
        confirm: fe.confirmPassword?.[0],
      })
      return
    }
    const { score } = getPasswordStrength(password)
    if (score < 3) {
      setErrors({ password: "Password is too weak" })
      return
    }
    if (!token) {
      setErrors({ password: "This reset link is missing its token. Request a new one." })
      return
    }
    setLoading(true)
    try {
      await authApi.resetPassword(token, password)
    } catch (err) {
      setLoading(false)
      setErrors({ password: authErrorMessage(err, "This reset link is invalid or has expired.") })
      return
    }
    setLoading(false)
    setDone(true)
    setTimeout(() => navigate("/login"), 2000)
  }
  const fieldBorder = (field: "pass" | "confirm") => {
    const err = field === "pass" ? errors.password : errors.confirm
    const val = field === "pass" ? password : confirm
    const focused = field === "pass" ? focusedPass : focusedConfirm
    if (err && touched.has(field === "pass" ? "password" : "confirm"))
      return "rgba(239,68,68,0.7)"
    if (val && !err) return "rgba(34,197,94,0.4)"
    if (focused) return "rgba(50,145,255,0.65)"
    return "rgba(255,255,255,0.08)"
  }
  return (
    <div className="dark [min-height:100vh] [display:flex] [align-items:center] [justify-content:center] [padding:24px] [font-family:Geist,_sans-serif] [background:#050510] [position:relative]">
      <div className="[position:fixed] [inset:0] [background-image:radial-gradient(circle_at_50%_30%,_rgba(50,145,255,0.06)_0%,_transparent_60%),_linear-gradient(rgba(50,145,255,0.02)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(50,145,255,0.02)_1px,_transparent_1px)] [background-size:100%,_44px_44px,_44px_44px] [pointer-events:none]" />

      <Link
        to="/"
        className="[position:fixed] [top:24px] [left:28px] [display:flex] [align-items:center] [gap:8px] [text-decoration:none]"
      >
        <SherlockLogo size={26} />
        <span className="[font-size:15px] [font-weight:700] [color:#fff] [letter-spacing:-0.02em]">
          Sherlock
        </span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="[width:100%] [max-width:400px] [position:relative] [z-index:1]"
      >
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="[display:flex] [flex-direction:column] [align-items:center] [text-align:center] [gap:16px]"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 220 }}
                className="[width:64px] [height:64px] [border-radius:50%] [background:rgba(34,197,94,0.1)] [border:1px_solid_rgba(34,197,94,0.3)] [display:flex] [align-items:center] [justify-content:center]"
              >
                <CheckCircle2 size={30} color="#22c55e" />
              </motion.div>
              <div>
                <h2 className="[font-size:22px] [font-weight:700] [color:#fff] [letter-spacing:-0.025em] [margin-bottom:6px]">
                  Password reset
                </h2>
                <p className="[font-size:13px] [color:rgba(255,255,255,0.38)]">
                  Redirecting you to sign in…
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form">
              <h1 className="[font-size:26px] [font-weight:700] [color:#fff] [letter-spacing:-0.03em] [margin-bottom:6px] [text-align:center]">
                Set new password
              </h1>
              <p className="[font-size:13px] [color:rgba(255,255,255,0.35)] [letter-spacing:-0.004em] [text-align:center] [margin-bottom:28px]">
                {"Create a strong password that you haven't used before."}
              </p>

              {!token && (
                <div className="[padding:12px_14px] [border-radius:10px] [background:rgba(239,68,68,0.08)] [border:1px_solid_rgba(239,68,68,0.2)] [display:flex] [gap:10px] [align-items:center] [margin-bottom:20px]">
                  <AlertCircle size={14} color="#ef4444" />
                  <p className="[font-size:12px] [color:rgba(255,255,255,0.55)]">
                    This reset link is invalid or has expired.{" "}
                    <Link to="/forgot-password" className="[color:#3291ff]">
                      Request a new one.
                    </Link>
                  </p>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="[display:flex] [flex-direction:column] [gap:16px]"
              >
                <div>
                  <label className="[font-size:13px] [font-weight:500] [color:rgba(255,255,255,0.55)] [display:block] [margin-bottom:5px]">
                    New password
                  </label>
                  <div className="[position:relative]">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      placeholder="Create a strong password"
                      autoComplete="new-password"
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedPass(true)}
                      onBlur={() => {
                        setFocusedPass(false)
                        setTouched((p) => new Set(p).add("password"))
                      }}
                      style={{
                        border: `1px solid ${fieldBorder("pass")}`,
                      }}
                      className={[
                        "[width:100%] [padding:10px_42px_10px_14px] [background:rgba(255,255,255,0.04)] [border-radius:10px] [color:#ededed] [font-size:13px] [font-family:Geist,_sans-serif] [outline:none] [letter-spacing:-0.004em] [transition:all_0.15s]",
                        focusedPass
                          ? "[box-shadow:0_0_0_3px_rgba(50,145,255,0.1)]"
                          : "[box-shadow:none]",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="[position:absolute] [right:12px] [top:50%] [transform:translateY(-50%)] [background:none] [border:none] [cursor:pointer] [color:rgba(255,255,255,0.3)] [display:flex] [padding:0]"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {password && <StrengthMeter password={password} />}
                  {touched.has("password") && errors.password && (
                    <p className="[font-size:12px] [color:#ef4444] [margin-top:5px] [display:flex] [align-items:center] [gap:4px]">
                      <AlertCircle size={11} />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="[font-size:13px] [font-weight:500] [color:rgba(255,255,255,0.55)] [display:block] [margin-bottom:5px]">
                    Confirm password
                  </label>
                  <div className="[position:relative]">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      onChange={(e) => setConfirm(e.target.value)}
                      onFocus={() => setFocusedConfirm(true)}
                      onBlur={() => {
                        setFocusedConfirm(false)
                        setTouched((p) => new Set(p).add("confirm"))
                      }}
                      style={{
                        border: `1px solid ${fieldBorder("confirm")}`,
                      }}
                      className={[
                        "[width:100%] [padding:10px_42px_10px_14px] [background:rgba(255,255,255,0.04)] [border-radius:10px] [color:#ededed] [font-size:13px] [font-family:Geist,_sans-serif] [outline:none] [letter-spacing:-0.004em] [transition:all_0.15s]",
                        focusedConfirm
                          ? "[box-shadow:0_0_0_3px_rgba(50,145,255,0.1)]"
                          : "[box-shadow:none]",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="[position:absolute] [right:12px] [top:50%] [transform:translateY(-50%)] [background:none] [border:none] [cursor:pointer] [color:rgba(255,255,255,0.3)] [display:flex] [padding:0]"
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {touched.has("confirm") && errors.confirm && (
                    <p className="[font-size:12px] [color:#ef4444] [margin-top:5px] [display:flex] [align-items:center] [gap:4px]">
                      <AlertCircle size={11} />
                      {errors.confirm}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={[
                    "[margin-top:4px] [width:100%] [padding:11px] [border-radius:10px] [border:none] [font-size:14px] [font-weight:600] [letter-spacing:-0.008em] [font-family:Geist,_sans-serif] [display:flex] [align-items:center] [justify-content:center] [gap:8px] [transition:all_0.2s]",
                    loading ? "[cursor:not-allowed]" : "[cursor:pointer]",
                    loading
                      ? "[background:rgba(255,255,255,0.08)]"
                      : "[background:linear-gradient(135deg,#3291ff,#7c3aed)]",
                    loading ? "[color:rgba(255,255,255,0.3)]" : "[color:#fff]",
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
                      Resetting…
                    </>
                  ) : (
                    <>
                      Reset password <ArrowRight size={14} />
                    </>
                  )}
                </button>

                <Link
                  to="/login"
                  className="[display:block] [text-align:center] [font-size:13px] [color:rgba(255,255,255,0.28)] [text-decoration:none] [letter-spacing:-0.003em]"
                >
                  Back to sign in
                </Link>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
