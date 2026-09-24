/**
 * React Bits — Blur Text
 * Each word fades + de-blurs in staggered sequence on mount.
 */
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface Props {
  text: string;
  className?: string;
  delay?: number;       // stagger delay between words (s)
  initialDelay?: number;
}

export function BlurText({ text, className, delay = 0.06, initialDelay = 0 }: Props) {
  const words = text.split(" ");
  return (
    <span className={cn("inline-flex flex-wrap gap-x-[0.25em]", className)}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, filter: "blur(10px)", y: 4 }}
          animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
          transition={{
            duration: 0.4,
            ease: "easeOut",
            delay: initialDelay + i * delay,
          }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
