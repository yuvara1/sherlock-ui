import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import type { ReactNode } from "react";

export interface BentoCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  children?: ReactNode;
  colSpan?: 1 | 2 | 3 | 4;
  rowSpan?: 1 | 2;
  className?: string;
}

const itemVariants = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const colSpanMap = {
  1: "",
  2: "md:col-span-2",
  3: "md:col-span-2 lg:col-span-3",
  4: "md:col-span-2 lg:col-span-4",
};

const rowSpanMap = { 1: "", 2: "md:row-span-2" };

export function BentoCard({
  title, description, icon, children,
  colSpan = 1, rowSpan = 1, className,
}: BentoCardProps) {
  return (
    <motion.div
      variants={itemVariants}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl",
        "border border-white/[0.08] bg-white/[0.03]",
        "hover:bg-white/[0.055] hover:border-white/[0.14] transition-colors duration-300",
        colSpanMap[colSpan],
        rowSpanMap[rowSpan],
        className,
      )}
    >
      {/* demo area */}
      <div className="relative flex-1 overflow-hidden p-5 pb-0 min-h-[140px]">
        {children}
      </div>

      {/* footer */}
      <div className="p-5 pt-4 flex flex-col gap-1">
        <div className="flex items-center gap-2 mb-1">
          {icon && (
            <span className="text-white/50 group-hover:text-white/80 transition-colors duration-200">
              {icon}
            </span>
          )}
          <h3 className="text-[13px] font-semibold text-white tracking-[-0.01em]">{title}</h3>
        </div>
        <p className="text-[11.5px] text-white/38 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}
