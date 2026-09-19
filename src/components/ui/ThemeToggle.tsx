import { Sun, Moon } from "lucide-react";
import { motion } from "motion/react";
import { useTheme } from "@/lib/theme";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className={`relative w-8 h-8 flex items-center justify-center rounded-md
        border border-[var(--border)] hover:border-[var(--border-2)]
        bg-[var(--bg-2)] hover:bg-[var(--bg-3)]
        text-[var(--text-3)] hover:text-[var(--text-1)]
        transition-colors duration-150 ${className ?? ""}`}
    >
      <motion.div
        key={theme}
        initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      </motion.div>
    </button>
  );
}
