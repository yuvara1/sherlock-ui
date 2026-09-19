import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Shell from "./components/Shell";
import RouteMeta from "./components/RouteMeta";
import {
  OverviewSkeleton,
  TablePageSkeleton,
  MetricsSkeleton,
  AISkeleton,
  ProfileSkeleton,
  DefaultPageSkeleton,
} from "@/components/ui/PageSkeleton";

// Public pages
const Landing       = lazy(() => import("./pages/Landing"));
const Login         = lazy(() => import("./pages/Login"));
const Register      = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// App pages
const Dashboard    = lazy(() => import("./pages/Dashboard"));
const Projects     = lazy(() => import("./pages/Projects"));
const Incidents    = lazy(() => import("./pages/Incidents"));
const ApiDebugger  = lazy(() => import("./pages/ApiDebugger"));
const Traces       = lazy(() => import("./pages/Traces"));
const Logs         = lazy(() => import("./pages/Logs"));
const Metrics      = lazy(() => import("./pages/Metrics"));
const Services     = lazy(() => import("./pages/Services"));
const Deployments  = lazy(() => import("./pages/Deployments"));
const Dependencies = lazy(() => import("./pages/Dependencies"));
const Integrations = lazy(() => import("./pages/Integrations"));
const Alerts       = lazy(() => import("./pages/Alerts"));
const Errors       = lazy(() => import("./pages/Errors"));
const AIAnalysis   = lazy(() => import("./pages/AIAnalysis"));
const Settings     = lazy(() => import("./pages/Settings"));
const NotFound     = lazy(() => import("./pages/NotFound"));

function PublicLoader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg)" }}>
      <div style={{ width: 20, height: 20, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteMeta />
      <Routes>
        {/* Public — simple spinner fallback */}
        <Route path="/" element={<Suspense fallback={<PublicLoader />}><Landing /></Suspense>} />
        <Route path="/login"           element={<Suspense fallback={<PublicLoader />}><Login /></Suspense>} />
        <Route path="/register"        element={<Suspense fallback={<PublicLoader />}><Register /></Suspense>} />
        <Route path="/forgot-password" element={<Suspense fallback={<PublicLoader />}><ForgotPassword /></Suspense>} />
        <Route path="/reset-password"  element={<Suspense fallback={<PublicLoader />}><ResetPassword /></Suspense>} />

        {/* App shell — per-route skeleton fallbacks */}
        <Route path="/app" element={<Shell />}>
          <Route index element={<Navigate to="/app/overview" replace />} />

          <Route path="overview"
            element={<Suspense fallback={<OverviewSkeleton />}><Dashboard /></Suspense>}
          />
          <Route path="projects"
            element={<Suspense fallback={<TablePageSkeleton statCount={3} />}><Projects /></Suspense>}
          />
          <Route path="incidents"
            element={<Suspense fallback={<TablePageSkeleton statCount={3} />}><Incidents /></Suspense>}
          />
          <Route path="errors"
            element={<Suspense fallback={<TablePageSkeleton statCount={3} />}><Errors /></Suspense>}
          />
          <Route path="logs"
            element={<Suspense fallback={<TablePageSkeleton />}><Logs /></Suspense>}
          />
          <Route path="traces"
            element={<Suspense fallback={<TablePageSkeleton />}><Traces /></Suspense>}
          />
          <Route path="services"
            element={<Suspense fallback={<TablePageSkeleton statCount={4} />}><Services /></Suspense>}
          />
          <Route path="deployments"
            element={<Suspense fallback={<TablePageSkeleton />}><Deployments /></Suspense>}
          />
          <Route path="dependencies"
            element={<Suspense fallback={<DefaultPageSkeleton />}><Dependencies /></Suspense>}
          />
          <Route path="integrations"
            element={<Suspense fallback={<DefaultPageSkeleton />}><Integrations /></Suspense>}
          />
          <Route path="alerts"
            element={<Suspense fallback={<TablePageSkeleton statCount={4} />}><Alerts /></Suspense>}
          />
          <Route path="metrics"
            element={<Suspense fallback={<MetricsSkeleton />}><Metrics /></Suspense>}
          />
          <Route path="apis"
            element={<Suspense fallback={<DefaultPageSkeleton />}><ApiDebugger /></Suspense>}
          />
          <Route path="ai"
            element={<Suspense fallback={<AISkeleton />}><AIAnalysis /></Suspense>}
          />
          <Route path="settings"
            element={<Suspense fallback={<ProfileSkeleton />}><Settings /></Suspense>}
          />
        </Route>

        {/* Legacy redirects */}
        <Route path="/dashboard"  element={<Navigate to="/app/overview" replace />} />
        <Route path="/incidents"  element={<Navigate to="/app/incidents" replace />} />
        <Route path="/traces"     element={<Navigate to="/app/traces" replace />} />
        <Route path="/logs"       element={<Navigate to="/app/logs" replace />} />
        <Route path="/metrics"    element={<Navigate to="/app/metrics" replace />} />
        <Route path="/services"   element={<Navigate to="/app/services" replace />} />
        <Route path="/ai"         element={<Navigate to="/app/ai" replace />} />
        <Route path="/debugger"   element={<Navigate to="/app/apis" replace />} />

        <Route path="*" element={<Suspense fallback={<PublicLoader />}><NotFound /></Suspense>} />
      </Routes>
    </BrowserRouter>
  );
}
