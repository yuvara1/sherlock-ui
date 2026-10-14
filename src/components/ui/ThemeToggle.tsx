import { useTheme } from "@/lib/theme"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <AnimatedThemeToggler
          theme={theme}
          onThemeChange={setTheme}
          variant="circle"
          duration={450}
          className={className}
        />
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      </TooltipContent>
    </Tooltip>
  )
}
