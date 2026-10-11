import pagerduty from "@/assets/integrations/pagerduty.png"
import opsgenie from "@/assets/integrations/opsgenie.png"
import victorops from "@/assets/integrations/victorops.png"
import slack from "@/assets/integrations/slack.png"
import teams from "@/assets/integrations/microsoft-teams.png"
import github from "@/assets/integrations/github.png"
import gitlab from "@/assets/integrations/gitlab.png"
import jenkins from "@/assets/integrations/jenkins.png"
import datadog from "@/assets/integrations/datadog.png"
import grafana from "@/assets/integrations/grafana.png"
import prometheus from "@/assets/integrations/prometheus.png"
import sentry from "@/assets/integrations/sentry.png"
import cloudwatch from "@/assets/integrations/aws-cloudwatch.png"
import jira from "@/assets/integrations/jira.png"
import linear from "@/assets/integrations/linear.png"
import servicenow from "@/assets/integrations/servicenow.png"

const BRAND_IMAGES: Record<string, string> = {
  PagerDuty: pagerduty,
  OpsGenie: opsgenie,
  VictorOps: victorops,
  Slack: slack,
  "Microsoft Teams": teams,
  GitHub: github,
  GitLab: gitlab,
  Jenkins: jenkins,
  Datadog: datadog,
  Grafana: grafana,
  Prometheus: prometheus,
  Sentry: sentry,
  "AWS CloudWatch": cloudwatch,
  Jira: jira,
  Linear: linear,
  ServiceNow: servicenow,
}

export default function IntegrationBrandIcon({ name }: { name: string }) {
  const src = BRAND_IMAGES[name]
  if (!src) return null
  return (
    <img
      src={src}
      alt={`${name} official icon`}
      width={20}
      height={20}
      className="size-5 shrink-0 object-contain"
      decoding="async"
      draggable={false}
    />
  )
}
