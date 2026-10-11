import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { MotionConfig } from "motion/react"
import { ThemeProvider } from "./lib/theme"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider>
      <TooltipProvider delayDuration={400}>
        <MotionConfig reducedMotion="user">
          <App />
        </MotionConfig>
      </TooltipProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
