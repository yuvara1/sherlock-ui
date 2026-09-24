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
  DeploymentsSkeleton,
  DependenciesSkeleton,
  IntegrationsSkeleton,
  AlertsSkeleton,
  ApiDebuggerSkeleton,
  LogsSkeleton,
  TracesSkeleton,
  RouteSkeleton,
} from "@/components/ui/PageSkeleton";

// Public pages
const Landing = lazy(() => import("./pages/Landing"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// App pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Projects = lazy(() => import("./pages/Projects"));
const Incidents = lazy(() => import("./pages/Incidents"));
const ApiDebugger = lazy(() => import("./pages/ApiDebugger"));
const Traces = lazy(() => import("./pages/Traces"));
const Logs = lazy(() => import("./pages/Logs"));
const Metrics = lazy(() => import("./pages/Metrics"));
const Services = lazy(() => import("./pages/Services"));
const Deployments = lazy(() => import("./pages/Deployments"));
const Dependencies = lazy(() => import("./pages/Dependencies"));
const Integrations = lazy(() => import("./pages/Integrations"));
const Alerts = lazy(() => import("./pages/Alerts"));
const Errors = lazy(() => import("./pages/Errors"));
const AIAnalysis = lazy(() => import("./pages/AIAnalysis"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

export default function App() {
  return (
    <BrowserRouter>
      <RouteMeta />
      <Routes>
        {/* Public pages use a compact content-agnostic skeleton while chunks load. */}
        <Route
          path="/"
          element={
            <Suspense fallback={<RouteSkeleton />}>
              <Landing />
            </Suspense>
          }
        />
        <Route
          path="/login"
          element={
            <Suspense fallback={<RouteSkeleton />}>
              <Login />
            </Suspense>
          }
        />
        <Route
          path="/register"
          element={
            <Suspense fallback={<RouteSkeleton />}>
              <Register />
            </Suspense>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <Suspense fallback={<RouteSkeleton />}>
              <ForgotPassword />
            </Suspense>
          }
        />
        <Route
          path="/reset-password"
          element={
            <Suspense fallback={<RouteSkeleton />}>
              <ResetPassword />
            </Suspense>
          }
        />

        {/* App shell — per-route skeleton fallbacks */}
        <Route path="/app" element={<Shell />}>
          <Route index element={<Navigate to="/app/overview" replace />} />

          <Route
            path="overview"
            element={
              <Suspense fallback={<OverviewSkeleton />}>
                <Dashboard />
              </Suspense>
            }
          />
          <Route
            path="projects"
            element={
              <Suspense fallback={<TablePageSkeleton statCount={3} rowH={56} titleW={120} />}>
                <Projects />
              </Suspense>
            }
          />
          <Route
            path="incidents"
            element={
              <Suspense
                fallback={
                  <TablePageSkeleton
                    statCount={4}
                    titleW={120}
                    colWidths={["1fr", "120px", "110px", "110px", "120px", "80px"]}
                  />
                }
              >
                <Incidents />
              </Suspense>
            }
          />
          <Route
            path="errors"
            element={
              <Suspense
                fallback={
                  <TablePageSkeleton
                    statCount={4}
                    titleW={90}
                    colWidths={["1fr", "100px", "100px", "110px", "120px", "80px", "60px"]}
                  />
                }
              >
                <Errors />
              </Suspense>
            }
          />
          <Route
            path="logs"
            element={
              <Suspense fallback={<LogsSkeleton />}>
                <Logs />
              </Suspense>
            }
          />
          <Route
            path="traces"
            element={
              <Suspense fallback={<TracesSkeleton />}>
                <Traces />
              </Suspense>
            }
          />
          <Route
            path="services"
            element={
              <Suspense
                fallback={
                  <TablePageSkeleton
                    statCount={4}
                    titleW={100}
                    colWidths={["1fr", "120px", "100px", "100px", "110px", "80px"]}
                  />
                }
              >
                <Services />
              </Suspense>
            }
          />
          <Route
            path="deployments"
            element={
              <Suspense fallback={<DeploymentsSkeleton />}>
                <Deployments />
              </Suspense>
            }
          />
          <Route
            path="dependencies"
            element={
              <Suspense fallback={<DependenciesSkeleton />}>
                <Dependencies />
              </Suspense>
            }
          />
          <Route
            path="integrations"
            element={
              <Suspense fallback={<IntegrationsSkeleton />}>
                <Integrations />
              </Suspense>
            }
          />
          <Route
            path="alerts"
            element={
              <Suspense fallback={<AlertsSkeleton />}>
                <Alerts />
              </Suspense>
            }
          />
          <Route
            path="metrics"
            element={
              <Suspense fallback={<MetricsSkeleton />}>
                <Metrics />
              </Suspense>
            }
          />
          <Route
            path="apis"
            element={
              <Suspense fallback={<ApiDebuggerSkeleton />}>
                <ApiDebugger />
              </Suspense>
            }
          />
          <Route
            path="ai"
            element={
              <Suspense fallback={<AISkeleton />}>
                <AIAnalysis />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<ProfileSkeleton />}>
                <Settings />
              </Suspense>
            }
          />
        </Route>

        {/* Legacy redirects */}
        <Route
          path="/dashboard"
          element={<Navigate to="/app/overview" replace />}
        />
        <Route
          path="/incidents"
          element={<Navigate to="/app/incidents" replace />}
        />
        <Route path="/traces" element={<Navigate to="/app/traces" replace />} />
        <Route path="/logs" element={<Navigate to="/app/logs" replace />} />
        <Route
          path="/metrics"
          element={<Navigate to="/app/metrics" replace />}
        />
        <Route
          path="/services"
          element={<Navigate to="/app/services" replace />}
        />
        <Route path="/ai" element={<Navigate to="/app/ai" replace />} />
        <Route path="/debugger" element={<Navigate to="/app/apis" replace />} />

        <Route
          path="*"
          element={
            <Suspense fallback={<RouteSkeleton />}>
              <NotFound />
            </Suspense>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
