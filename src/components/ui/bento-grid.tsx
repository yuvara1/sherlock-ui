import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import type { ReactNode } from "react";

export interface BentoGridProps {
  className?: string;
  children?: ReactNode;
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09 } },
};

export function BentoGrid({ className, children }: BentoGridProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export default BentoGrid;
