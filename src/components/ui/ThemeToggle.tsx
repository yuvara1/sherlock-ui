import { Sun, Moon } from "lucide-react"
import { motion } from "motion/react"
import { useTheme } from "@/lib/theme"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          onClick={toggle}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          className={`relative text-muted-foreground ${className ?? ""}`}
        >
          <motion.div
            key={theme}
            initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </motion.div>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      </TooltipContent>
    </Tooltip>
  )
}
