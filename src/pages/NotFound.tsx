import { Link, useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { ArrowLeft, ArrowRight, Home, Search } from "lucide-react"
import { NavbarLogo } from "@/components/ui/resizable-navbar"
const QUICK_LINKS = [
  { label: "Overview", to: "/app/overview" },
  { label: "Incidents", to: "/app/incidents" },
  { label: "Pricing", to: "/#pricing" },
  { label: "Sign in", to: "/login" },
]
export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="dark [min-height:100vh] [background:#000] [color:#fff] [font-family:Geist,_sans-serif] [display:flex] [flex-direction:column] [overflow-x:hidden]">
      {/* faint dot grid */}
      <div className="[position:fixed] [inset:0] [z-index:0] [pointer-events:none] [background-image:radial-gradient(circle,_rgba(255,255,255,0.05)_1px,_transparent_1px)] [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,_#000_20%,_transparent_75%)] [-webkit-mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,_#000_20%,_transparent_75%)]" />

      {/* top logo */}
      <header className="[position:relative] [z-index:10] [padding:24px_20px]">
        <NavbarLogo />
      </header>

      {/* center content */}
      <main className="[position:relative] [z-index:10] [flex:1] [display:flex] [flex-direction:column] [align-items:center] [justify-content:center] [text-align:center] [padding:40px_20px_80px] [width:100%] [max-width:560px] [margin:0_auto]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="[width:100%]"
        >
          <span className="[display:inline-flex] [align-items:center] [gap:6px] [font-size:12px] [font-weight:500] [padding:4px_12px] [border-radius:99px] [background:rgba(255,255,255,0.06)] [border:1px_solid_rgba(255,255,255,0.14)] [color:rgba(255,255,255,0.55)] [margin-bottom:28px]">
            <Search size={11} />
            Error 404
          </span>

          <div className="[font-size:clamp(84px,_26vw,_180px)] [font-weight:800] [letter-spacing:-0.06em] [line-height:0.9] [color:transparent] [-webkit-text-stroke:1.5px_rgba(255,255,255,0.14)] [user-select:none] [margin-bottom:8px]">
            404
          </div>

          <h1 className="[font-size:clamp(24px,_6vw,_34px)] [font-weight:700] [letter-spacing:-0.03em] [margin:0_0_12px] [line-height:1.15]">
            This trace leads nowhere.
          </h1>
          <p className="[font-size:clamp(14px,_3.5vw,_16px)] [color:rgba(255,255,255,0.42)] [line-height:1.6] [margin:0_auto_32px] [max-width:380px]">
            The page you're looking for was moved, renamed, or never existed.
            Let's get you back on a healthy path.
          </p>

          {/* actions — stack on mobile, row on wider */}
          <div className="[display:flex] [flex-wrap:wrap] [gap:12px] [justify-content:center] [margin-bottom:40px]">
            <Link
              to="/"
              className="[text-decoration:none] [flex:1_1_auto] [max-width:220px]"
            >
              <button className="[width:100%] [display:inline-flex] [align-items:center] [justify-content:center] [gap:8px] [font-size:14px] [font-weight:600] [color:#000] [background:#fff] [border:none] [border-radius:10px] [padding:12px_22px] [cursor:pointer] [transition:opacity_0.15s] hover:[opacity:0.85]">
                <Home size={15} /> Back home
              </button>
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="[flex:1_1_auto] [max-width:220px] [display:inline-flex] [align-items:center] [justify-content:center] [gap:8px] [font-size:14px] [font-weight:500] [color:rgba(255,255,255,0.7)] [background:rgba(255,255,255,0.05)] [border:1px_solid_rgba(255,255,255,0.12)] [border-radius:10px] [padding:12px_22px] [cursor:pointer] [transition:all_0.15s] hover:[background:rgba(255,255,255,0.09)] hover:[color:#fff]"
            >
              <ArrowLeft size={15} /> Go back
            </button>
          </div>

          {/* quick links */}
          <div className="[border-top:1px_solid_rgba(255,255,255,0.08)] [padding-top:24px]">
            <p className="[font-size:11px] [font-weight:600] [letter-spacing:0.08em] [text-transform:uppercase] [color:rgba(255,255,255,0.3)] [margin:0_0_14px]">
              Popular destinations
            </p>
            <div className="[display:flex] [flex-wrap:wrap] [gap:8px] [justify-content:center]">
              {QUICK_LINKS.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  className="[display:inline-flex] [align-items:center] [gap:5px] [font-size:13px] [color:rgba(255,255,255,0.6)] [text-decoration:none] [background:rgba(255,255,255,0.04)] [border:1px_solid_rgba(255,255,255,0.1)] [border-radius:99px] [padding:7px_14px] [transition:all_0.15s] hover:[color:#fff] hover:[border-color:rgba(255,255,255,0.3)]"
                >
                  {l.label} <ArrowRight size={12} />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
