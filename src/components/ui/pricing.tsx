import React from "react";
import { motion, type Transition } from "motion/react";
import { CheckCircleIcon, StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type FREQUENCY = "monthly" | "yearly";
const frequencies: FREQUENCY[] = ["monthly", "yearly"];

export interface Plan {
  name: string;
  info: string;
  price: { monthly: number; yearly: number };
  features: { text: string; tooltip?: string }[];
  btn: { text: string; href: string; onClick?: () => void };
  highlighted?: boolean;
}

interface PricingSectionProps extends React.ComponentProps<"div"> {
  plans: Plan[];
  heading: string;
  description?: string;
}

export function PricingSection({ plans, heading, description, ...props }: PricingSectionProps) {
  const [frequency, setFrequency] = React.useState<FREQUENCY>("monthly");

  return (
    <div
      className={cn("flex w-full flex-col items-center justify-center space-y-5 p-4", props.className)}
      {...props}
    >
      <div className="mx-auto max-w-xl space-y-2">
        <h2 className="text-center text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl">
          {heading}
        </h2>
        {description && (
          <p className="text-center text-sm md:text-base" style={{ color: "rgba(255,255,255,0.4)" }}>
            {description}
          </p>
        )}
      </div>
      <PricingFrequencyToggle frequency={frequency} setFrequency={setFrequency} />
      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <PricingCard plan={plan} key={plan.name} frequency={frequency} />
        ))}
      </div>
    </div>
  );
}

type PricingFrequencyToggleProps = React.ComponentProps<"div"> & {
  frequency: FREQUENCY;
  setFrequency: React.Dispatch<React.SetStateAction<FREQUENCY>>;
};

export function PricingFrequencyToggle({ frequency, setFrequency, ...props }: PricingFrequencyToggleProps) {
  return (
    <div
      className={cn("mx-auto flex w-fit rounded-full p-1", props.className)}
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
      {...props}
    >
      {frequencies.map((freq) => (
        <button
          key={freq}
          onClick={() => setFrequency(freq)}
          className="relative px-4 py-1 text-sm capitalize"
          style={{ color: frequency === freq ? "#000" : "rgba(255,255,255,0.5)" }}
        >
          <span className="relative z-10">{freq}</span>
          {frequency === freq && (
            <motion.span
              layoutId="frequency"
              transition={{ type: "spring", duration: 0.4 }}
              style={{ background: "#fff" }}
              className="absolute inset-0 z-0 rounded-full"
            />
          )}
        </button>
      ))}
    </div>
  );
}

type PricingCardProps = React.ComponentProps<"div"> & {
  plan: Plan;
  frequency?: FREQUENCY;
};

export function PricingCard({ plan, className, frequency = frequencies[0], ...props }: PricingCardProps) {
  const isFree = plan.price.monthly === 0;
  const saving = Math.round(
    ((plan.price.monthly * 12 - plan.price.yearly) / (plan.price.monthly * 12)) * 100,
  );

  return (
    <div
      className={cn("relative flex w-full flex-col rounded-xl", className)}
      style={{
        border: plan.highlighted ? "1px solid rgba(255,255,255,0.25)" : "1px solid rgba(255,255,255,0.08)",
        background: plan.highlighted ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
      }}
      {...props}
    >
      {plan.highlighted && <BorderTrail size={100} />}

      {/* Header */}
      <div
        className="rounded-t-xl border-b p-5"
        style={{
          borderColor: plan.highlighted ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
          background: plan.highlighted ? "rgba(255,255,255,0.04)" : "transparent",
        }}
      >
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {plan.highlighted && (
            <p
              className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
              style={{ background: "#fff", color: "#000", border: "none" }}
            >
              <StarIcon className="h-3 w-3 fill-current" />
              Popular
            </p>
          )}
          {frequency === "yearly" && !isFree && saving > 0 && (
            <p
              className="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
              style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              {saving}% off
            </p>
          )}
        </div>

        <div className="text-base font-semibold" style={{ color: "#fff" }}>{plan.name}</div>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{plan.info}</p>
        <h3 className="mt-3 flex items-end gap-1">
          <span className="text-4xl font-bold" style={{ color: "#fff", letterSpacing: "-0.04em" }}>
            {isFree ? "Free" : `$${frequency === "monthly" ? plan.price.monthly : plan.price.yearly}`}
          </span>
          {!isFree && (
            <span className="mb-1 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
              /{frequency === "monthly" ? "month" : "year"}
            </span>
          )}
        </h3>
      </div>

      {/* Features */}
      <div className="flex-1 space-y-3.5 px-5 py-6 text-sm">
        {plan.features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2.5">
            <CheckCircleIcon className="h-4 w-4 flex-shrink-0" style={{ color: plan.highlighted ? "#fff" : "rgba(255,255,255,0.4)" }} />
            <TooltipProvider>
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <p
                    className={cn(feature.tooltip && "cursor-pointer border-b border-dashed border-white/20")}
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    {feature.text}
                  </p>
                </TooltipTrigger>
                {feature.tooltip && (
                  <TooltipContent>
                    <p>{feature.tooltip}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        className="mt-auto rounded-b-xl border-t p-4"
        style={{
          borderColor: plan.highlighted ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.07)",
          background: plan.highlighted ? "rgba(255,255,255,0.04)" : "transparent",
        }}
      >
        {plan.btn.onClick ? (
          <button
            onClick={plan.btn.onClick}
            className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity hover:opacity-85"
            style={
              plan.highlighted
                ? { background: "#fff", color: "#000", border: "none" }
                : { background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }
            }
          >
            {plan.btn.text}
          </button>
        ) : (
          <a href={plan.btn.href} style={{ textDecoration: "none" }}>
            <button
              className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity hover:opacity-85"
              style={
                plan.highlighted
                  ? { background: "#fff", color: "#000", border: "none" }
                  : { background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }
              }
            >
              {plan.btn.text}
            </button>
          </a>
        )}
      </div>
    </div>
  );
}

type BorderTrailProps = {
  className?: string;
  size?: number;
  transition?: Transition;
  delay?: number;
  onAnimationComplete?: () => void;
  style?: React.CSSProperties;
};

export function BorderTrail({ className, size = 60, transition, delay, onAnimationComplete, style }: BorderTrailProps) {
  const BASE_TRANSITION = { repeat: Infinity, duration: 5, ease: "linear" } as const;

  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
      <motion.div
        className={cn("absolute aspect-square bg-white/60", className)}
        style={{ width: size, offsetPath: `rect(0 auto auto 0 round ${size}px)`, ...style }}
        animate={{ offsetDistance: ["0%", "100%"] }}
        transition={{ ...(transition ?? BASE_TRANSITION), delay }}
        onAnimationComplete={onAnimationComplete}
      />
    </div>
  );
}
