import IntegrationConsole from "@/components/workspace/IntegrationConsole"
import IntegrationBrandIcon from "@/components/workspace/IntegrationBrandIcon"
/* ── Data ─────────────────────────────────────────────────── */
type Category = "Alerting" | "CI/CD" | "Logging" | "APM" | "Communication" | "Ticketing"
interface Integration {
  name: string
  desc: string
  category: Category
  publisher: string
}
const INTEGRATIONS: Integration[] = [
  {
    name: "PagerDuty",
    desc: "Route incidents to your on-call team.",
    publisher: "PagerDuty",
    category: "Alerting",
  },
  {
    name: "OpsGenie",
    desc: "On-call schedules and alert escalation.",
    publisher: "Atlassian",
    category: "Alerting",
  },
  {
    name: "VictorOps",
    desc: "Coordinate incident response with Splunk On-Call.",
    publisher: "Splunk",
    category: "Alerting",
  },
  {
    name: "Slack",
    desc: "Share investigation summaries in your channels on demand.",
    publisher: "Slack",
    category: "Communication",
  },
  {
    name: "Microsoft Teams",
    desc: "Share incident updates with your team.",
    publisher: "Microsoft",
    category: "Communication",
  },
  {
    name: "GitHub",
    desc: "Review commits, pull requests, and Actions runs on demand.",
    publisher: "GitHub",
    category: "CI/CD",
  },
  {
    name: "GitLab",
    desc: "Review merge requests and pipeline results.",
    publisher: "GitLab",
    category: "CI/CD",
  },
  {
    name: "Jenkins",
    desc: "Track build and deployment outcomes.",
    publisher: "Jenkins",
    category: "CI/CD",
  },
  {
    name: "Datadog",
    desc: "Bring metrics and traces into investigations.",
    publisher: "Datadog",
    category: "APM",
  },
  {
    name: "Grafana",
    desc: "Explore service dashboards and health panels.",
    publisher: "Grafana Labs",
    category: "APM",
  },
  {
    name: "Prometheus",
    desc: "Monitor application and infrastructure metrics.",
    publisher: "Prometheus",
    category: "APM",
  },
  {
    name: "Sentry",
    desc: "Investigate error groups and stack traces.",
    publisher: "Sentry",
    category: "Logging",
  },
  {
    name: "AWS CloudWatch",
    desc: "Review AWS alarms, logs, and metrics.",
    publisher: "Amazon Web Services",
    category: "Logging",
  },
  {
    name: "Jira",
    desc: "Track incident follow-ups and remediation work.",
    publisher: "Atlassian",
    category: "Ticketing",
  },
  {
    name: "Linear",
    desc: "Turn investigations into engineering issues.",
    publisher: "Linear",
    category: "Ticketing",
  },
  {
    name: "ServiceNow",
    desc: "Connect incident and change-management workflows.",
    publisher: "ServiceNow",
    category: "Ticketing",
  },
]
export default function Integrations() {
  return (
    <IntegrationConsole
      catalog={INTEGRATIONS}
      renderIcon={(name) => <IntegrationBrandIcon name={name} />}
    />
  )
}
