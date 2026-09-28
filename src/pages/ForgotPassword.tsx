import { useState } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import { GridBackground } from "@/components/ui/GridBackground"
import { BorderBeam } from "@/components/ui/BorderBeam"
import { MovingBorderBtn } from "@/components/ui/MovingBorderBtn"
export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(false)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 1200)
  }
  return (
    <div className="dark [min-height:100vh] [background:#000] [display:flex] [align-items:center] [justify-content:center] [padding:24px] [font-family:Geist,_sans-serif] [position:relative] [overflow:hidden]">
      <GridBackground dots className="absolute inset-0 opacity-15" />

      {/* Subtle glow */}
      <div className="[position:absolute] [top:20%] [left:50%] [transform:translateX(-50%)] [width:600px] [height:400px] [border-radius:50%] [background:radial-gradient(circle,_rgba(50,145,255,0.08)_0%,_transparent_70%)] [filter:blur(60px)] [pointer-events:none]" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="[width:100%] [max-width:420px] [position:relative] [z-index:10]"
      >
        {/* Logo */}
        <div className="[display:flex] [align-items:center] [gap:10px] [margin-bottom:32px] [justify-content:center]">
          <div className="[width:32px] [height:32px] [border-radius:8px] [background:linear-gradient(135deg,_#3291ff_0%,_#7c3aed_100%)] [display:flex] [align-items:center] [justify-content:center]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3" fill="white" />
              <path
                d="M8 1v2M8 13v2M1 8h2M13 8h2M3.5 3.5l1.4 1.4M11.1 11.1l1.4 1.4M3.5 12.5l1.4-1.4M11.1 4.9l1.4-1.4"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="[font-size:17px] [font-weight:700] [color:#fff] [letter-spacing:-0.02em]">
            Sherlock
          </span>
        </div>

        {/* Card */}
        <div className="[position:relative] [border-radius:20px] [overflow:hidden] [border:1px_solid_rgba(255,255,255,0.07)] [background:rgba(255,255,255,0.025)]">
          <BorderBeam
            size={200}
            duration={10}
            colorFrom="#3291ff"
            colorTo="#7c3aed"
          />

          <div className="[padding:36px_32px]">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="[text-align:center] [display:flex] [flex-direction:column] [align-items:center] [gap:16px]"
                >
                  <div className="[width:52px] [height:52px] [border-radius:50%] [background:rgba(61,214,140,0.1)] [border:1px_solid_rgba(61,214,140,0.3)] [display:flex] [align-items:center] [justify-content:center]">
                    <CheckCircle2 size={24} color="#3dd68c" />
                  </div>
                  <div>
                    <h2 className="[font-size:20px] [font-weight:700] [color:#fff] [letter-spacing:-0.02em] [margin-bottom:8px]">
                      Check your email
                    </h2>
                    <p className="[font-size:13px] [color:rgba(255,255,255,0.42)] [line-height:1.6]">
                      If an account exists for{" "}
                      <strong className="[color:rgba(255,255,255,0.7)]">
                        {email}
                      </strong>
                      , {"you'll receive a password reset link shortly."}
                    </p>
                  </div>
                  <Link
                    to="/login"
                    className="[margin-top:8px] [display:inline-flex] [align-items:center] [gap:6px] [font-size:13px] [color:#3291ff] [text-decoration:none] [letter-spacing:-0.004em]"
                  >
                    <ArrowLeft size={13} /> Back to sign in
                  </Link>
                </motion.div>
              ) : (
                <motion.div key="form">
                  <h2 className="[font-size:22px] [font-weight:700] [color:#fff] [letter-spacing:-0.025em] [margin-bottom:6px]">
                    Forgot password?
                  </h2>
                  <p className="[font-size:13px] [color:rgba(255,255,255,0.38)] [margin-bottom:28px] [line-height:1.6]">
                    {
                      "Enter your email and we'll send you a link to reset your password."
                    }
                  </p>

                  <form
                    onSubmit={handleSubmit}
                    className="[display:flex] [flex-direction:column] [gap:18px]"
                  >
                    <div className="[display:flex] [flex-direction:column] [gap:6px]">
                      <label className="[font-size:13px] [font-weight:500] [color:#ededed]">
                        Email address
                      </label>
                      <div className="[position:relative]">
                        <Mail
                          size={14}
                          className="[position:absolute] [left:12px] [top:50%] [transform:translateY(-50%)] [color:rgba(255,255,255,0.3)] [pointer-events:none]"
                        />
                        <input
                          type="email"
                          placeholder="you@company.com"
                          value={email}
                          required
                          onChange={(e) => setEmail(e.target.value)}
                          onFocus={() => setFocused(true)}
                          onBlur={() => setFocused(false)}
                          style={{
                            border: `1px solid ${
                              focused
                                ? "rgba(50,145,255,0.6)"
                                : "rgba(255,255,255,0.08)"
                            }`,
                          }}
                          className={[
                            "[width:100%] [padding:10px_14px_10px_36px] [background:rgba(255,255,255,0.04)] [border-radius:10px] [color:#ededed] [font-size:13px] [font-family:Geist,_sans-serif] [outline:none] [transition:border-color_0.15s,_box-shadow_0.15s]",
                            focused
                              ? "[box-shadow:0_0_0_3px_rgba(50,145,255,0.12)]"
                              : "[box-shadow:none]",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        />
                      </div>
                    </div>

                    <MovingBorderBtn type="submit" disabled={loading}>
                      {loading ? (
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
                        "Send reset link"
                      )}
                    </MovingBorderBtn>
                  </form>

                  <div className="[text-align:center] [margin-top:24px]">
                    <Link
                      to="/login"
                      className="[display:inline-flex] [align-items:center] [gap:6px] [font-size:13px] [color:rgba(255,255,255,0.4)] [text-decoration:none] [transition:color_0.15s] hover:[color:rgba(255,255,255,0.7)]"
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
    </div>
  )
}
