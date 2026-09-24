/**
 * React Bits — Typewriter
 * Cycles through an array of phrases with a typing + deleting animation.
 */
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  phrases: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseMs?: number;
}

export function Typewriter({
  phrases,
  className,
  typingSpeed = 55,
  deletingSpeed = 28,
  pauseMs = 2200,
}: Props) {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [charIdx, setCharIdx]     = useState(0);
  const [deleting, setDeleting]   = useState(false);

  useEffect(() => {
    const current = phrases[phraseIdx];
    if (!deleting && charIdx === current.length) {
      const id = setTimeout(() => setDeleting(true), pauseMs);
      return () => clearTimeout(id);
    }
    if (deleting && charIdx === 0) {
      setDeleting(false);
      setPhraseIdx((i) => (i + 1) % phrases.length);
      return;
    }
    const id = setTimeout(() => {
      setCharIdx((i) => i + (deleting ? -1 : 1));
    }, deleting ? deletingSpeed : typingSpeed);
    return () => clearTimeout(id);
  }, [charIdx, deleting, phraseIdx, phrases, typingSpeed, deletingSpeed, pauseMs]);

  return (
    <span className={cn("inline-block", className)}>
      {phrases[phraseIdx].slice(0, charIdx)}
      <span className="caret-blink ml-0.5 inline-block w-0.5 h-[1em] align-middle"
        style={{ background: "var(--accent, #0070f3)", verticalAlign: "middle" }} />
    </span>
  );
}
