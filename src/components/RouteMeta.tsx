import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE = "Sherlock";
const DEFAULT_DESC =
  "AI-powered observability for SRE teams — instant root cause analysis, distributed tracing, and noise-free alerting.";

/** path → [title, description]. Title is suffixed with the site name automatically. */
const META: Record<string, [string, string?]> = {
  "/": ["AI-powered observability for SRE teams", DEFAULT_DESC],
  "/login": ["Sign in", "Sign in to your Sherlock account."],
  "/register": ["Create your account", "Start monitoring your services with Sherlock — free for 3 services."],
  "/forgot-password": ["Reset your password", "Recover access to your Sherlock account."],
  "/reset-password": ["Set a new password", "Choose a new password for your Sherlock account."],
  "/app/overview": ["Overview", "System health at a glance — error rates, latency, and incidents in real time."],
  "/app/projects": ["Projects", "Manage services, API keys, team members, and environments."],
  "/app/incidents": ["Incidents", "AI root cause analysis, severity routing, and guided resolution."],
  "/app/errors": ["Errors", "Error grouping, stack traces, and occurrence frequency across services."],
  "/app/logs": ["Logs", "Stream, search, and filter structured logs in real time."],
  "/app/traces": ["Traces", "Distributed trace waterfalls with span timing and anomaly highlights."],
  "/app/services": ["Services", "Service catalog with health status, SLAs, and endpoint performance."],
  "/app/deployments": ["Deployments", "Correlate releases with performance regressions and incidents."],
  "/app/dependencies": ["Dependencies", "Interactive topology graph — visualize blast radius and impact."],
  "/app/metrics": ["Metrics", "RED metrics, SLOs, and custom dashboards in one place."],
  "/app/apis": ["API Debugger", "HTTP request builder with response inspection and timing breakdown."],
  "/app/ai": ["AI Debugger", "Conversational root cause analysis, backed by evidence."],
  "/app/settings": ["Settings", "Manage your account, API keys, and preferences."],
};

function setMeta(name: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export default function RouteMeta() {
  const { pathname } = useLocation();

  useEffect(() => {
    const entry = META[pathname];
    const [title, desc] = entry ?? ["Page not found", "The page you're looking for doesn't exist."];
    document.title = pathname === "/" ? `${SITE} — ${title}` : `${title} · ${SITE}`;
    setMeta("description", desc ?? DEFAULT_DESC);
  }, [pathname]);

  return null;
}
