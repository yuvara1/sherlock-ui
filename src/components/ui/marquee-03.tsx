import { Card, CardContent } from "@/components/ui/card";
import { Marquee } from "@/components/ui/marquee-03-utils/marquee";

type Review = {
  name: string;
  username: string;
  role: string;
  body: string;
  profile: string;
};

const reviews: Review[] = [
  {
    name: "Priya Nair",
    username: "@priya_sre",
    role: "Staff SRE · Stripe",
    body: "We went from 45-minute MTTR to under 8 minutes. Sherlock traced a HikariCP exhaustion to a missing index in v2.14 — two sprints of pain, resolved in one conversation.",
    profile: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=64&h=64&fit=crop&auto=format",
  },
  {
    name: "Marcus Chen",
    username: "@marcuschen",
    role: "Senior SRE · Shopify",
    body: "The dependency graph alone saved three all-nighters. We could see blast radius instantly during our payment gateway incident. Root cause in 4 minutes, not 4 hours.",
    profile: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&auto=format",
  },
  {
    name: "Aisha Okonkwo",
    username: "@aisha_platform",
    role: "Platform Engineer · Vercel",
    body: "Datadog was giving us 400 alerts a night. Sherlock's ML correlation reduced that to 12 actionable P0s. Our on-call rotation finally sleeps.",
    profile: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=64&h=64&fit=crop&auto=format",
  },
  {
    name: "Tomáš Dvořák",
    username: "@tomas_infra",
    role: "Principal SRE · Cloudflare",
    body: "The OTel-native setup took 20 minutes. We had full trace waterfall and anomaly detection running in production before the sprint review.",
    profile: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64&fit=crop&auto=format",
  },
  {
    name: "Yuki Tanaka",
    username: "@yuki_sre",
    role: "SRE Lead · Linear",
    body: "AI root cause isn't marketing. It reads the stacktrace, cross-references the deploy diff, and tells you exactly which regression caused the p99 spike.",
    profile: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=64&h=64&fit=crop&auto=format",
  },
  {
    name: "Rania Khalil",
    username: "@rania_ops",
    role: "Infrastructure Lead · Notion",
    body: "We evaluated six APM tools. Sherlock was the only one that felt built for AI-assisted workflows rather than retrofitted. Onboarded the whole team in a day.",
    profile: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=64&h=64&fit=crop&auto=format",
  },
  {
    name: "Devon Park",
    username: "@devonpark_eng",
    role: "Senior SWE · Railway",
    body: "The distributed trace waterfall caught an N+1 query regression we'd been chasing across three services. Ten minutes after connecting, we had the fix.",
    profile: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=64&h=64&fit=crop&auto=format",
  },
  {
    name: "Leila Ahmadi",
    username: "@leila_sre",
    role: "Site Reliability · Fly.io",
    body: "Noise-free alerting changed our on-call culture completely. We went from alert fatigue to trusting every page. The team's confidence in incidents is night and day.",
    profile: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=64&h=64&fit=crop&auto=format",
  },
  {
    name: "James Osei",
    username: "@josei_platform",
    role: "Platform SRE · Supabase",
    body: "Post-mortem auto-drafting alone is worth it. After every resolved incident we get a structured report with timeline, root cause, and action items. Saved hours per week.",
    profile: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&auto=format",
  },
];

const ReviewCard = ({ profile, name, username, role, body }: Review) => {
  return (
    <Card className="relative w-full cursor-pointer overflow-hidden border border-white/[0.08] bg-white/[0.03] shadow-none p-4 hover:bg-white/[0.055] transition-colors duration-200">
      <CardContent className="p-0 flex flex-col gap-3">
        <div className="flex flex-row items-center gap-2.5">
          <img
            className="rounded-full object-cover flex-shrink-0"
            width="32"
            height="32"
            alt={name}
            src={profile}
            style={{ width: 32, height: 32 }}
          />
          <div className="flex flex-col min-w-0">
            <p className="text-sm font-semibold text-white truncate">{name}</p>
            <p className="text-[10px] font-medium text-white/35 truncate">{role}</p>
          </div>
        </div>
        <p className="text-[12.5px] text-white/50 leading-relaxed">{body}</p>
        <p className="text-[10px] font-mono text-white/20">{username}</p>
      </CardContent>
    </Card>
  );
};

const VerticalMarqueeDemo = () => {
  return (
    <div className="relative flex h-[500px] w-full flex-row items-center justify-center overflow-hidden">
      <div className="flex flex-row items-start justify-center w-full gap-3 px-0 h-full">
        {/* col 1 — bottom to top (default) */}
        <Marquee pauseOnHover vertical className="[--duration:10s] h-full flex flex-col flex-1 gap-3">
          {reviews.filter((_, i) => i % 3 === 0).map((review, idx) => (
            <ReviewCard key={idx} {...review} />
          ))}
        </Marquee>
        {/* col 2 — top to bottom (reverse) */}
        <Marquee reverse pauseOnHover vertical className="[--duration:13s] h-full hidden sm:flex flex-col flex-1 gap-3">
          {reviews.filter((_, i) => i % 3 === 1).map((review, idx) => (
            <ReviewCard key={idx} {...review} />
          ))}
        </Marquee>
        {/* col 3 — bottom to top (same as col 1) */}
        <Marquee pauseOnHover vertical className="[--duration:11s] h-full hidden lg:flex flex-col flex-1 gap-3">
          {reviews.filter((_, i) => i % 3 === 2).map((review, idx) => (
            <ReviewCard key={idx} {...review} />
          ))}
        </Marquee>
      </div>
      {/* top/bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24" style={{ background: "linear-gradient(to bottom, #000, transparent)" }} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24" style={{ background: "linear-gradient(to top, #000, transparent)" }} />
    </div>
  );
};

export default VerticalMarqueeDemo;
