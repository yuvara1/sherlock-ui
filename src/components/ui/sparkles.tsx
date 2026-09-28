import React from "react";
import { Particles, ParticlesProvider, useParticlesProvider } from "@tsparticles/react";
import type { Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { cn } from "@/lib/utils";
import { motion, useAnimation } from "motion/react";

type ParticlesProps = {
  id?: string;
  className?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  speed?: number;
  particleColor?: string;
  particleDensity?: number;
};

async function initSlim(engine: Engine) {
  await loadSlim(engine);
}

function SparklesInner({ id, className, background, minSize, maxSize, speed, particleColor, particleDensity }: ParticlesProps) {
  const { loaded } = useParticlesProvider();
  const controls = useAnimation();

  const particlesLoaded = async () => {
    controls.start({ opacity: 1, transition: { duration: 1 } });
  };

  return (
    <motion.div animate={controls} className={cn("opacity-0 w-full h-full", className)}>
      {loaded && (
        <Particles
          id={id}
          className="w-full h-full"
          particlesLoaded={particlesLoaded}
          options={{
            background: { color: { value: background || "transparent" } },
            fullScreen: { enable: false, zIndex: 1 },
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: { enable: false },
                onHover: { enable: false },
              },
            },
            particles: {
              color: { value: particleColor || "#ffffff" },
              move: {
                direction: "none",
                enable: true,
                outModes: { default: "out" },
                random: false,
                speed: { min: 0.1, max: speed || 1 },
                straight: false,
              },
              number: {
                density: { enable: true, width: 400, height: 400 },
                value: particleDensity || 120,
              },
              opacity: {
                value: { min: 0.1, max: 0.9 },
                animation: {
                  enable: true,
                  speed: speed || 4,
                  sync: false,
                },
              },
              shape: { type: "circle" },
              size: { value: { min: minSize || 1, max: maxSize || 3 } },
            },
            detectRetina: true,
          }}
        />
      )}
    </motion.div>
  );
}

export function SparklesCore(props: ParticlesProps) {
  return (
    <ParticlesProvider init={initSlim}>
      <SparklesInner {...props} />
    </ParticlesProvider>
  );
}
