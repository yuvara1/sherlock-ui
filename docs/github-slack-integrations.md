# GitHub and Slack: first-phase setup

The integration APIs run in **project-service** and are routed through the authenticated
gateway at `/api/v1/integrations`. No service on port 8092 is needed.

## Configure and deploy

1. Create a GitHub **OAuth App**. Set its authorization callback URL to
   `https://sherlock-in.vercel.app/app/integrations?provider=github`.
   This first phase uses the `repo` OAuth scope (including private repositories and
   GitHub's broader read/write grant), although Sherlock only performs read requests.
   GitHub OAuth cannot restrict this grant to a single repository; use a dedicated
   account or organization policy if necessary. A fine-grained GitHub App is a future phase.
2. Create a Slack app, enable **Incoming Webhooks**, and add the bot OAuth scope
   `incoming-webhook`. Add
   `https://sherlock-in.vercel.app/app/integrations?provider=slack` as a redirect URL.
   Authorization asks the user to choose the destination channel. Workspace app
  approval policies may require an administrator.
3. Configure project-service environment variables from `backend/example.env`:
   `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`, `GITHUB_OAUTH_REDIRECT_URI`,
   `SLACK_OAUTH_CLIENT_ID`, `SLACK_OAUTH_CLIENT_SECRET`, `SLACK_OAUTH_REDIRECT_URI`,
   and `INTEGRATION_ENCRYPTION_KEY_BASE64`. Generate the encryption key with
   `openssl rand -base64 32`. Retain it securely across deployments and back it up;
   changing it without migrating encrypted credentials requires reconnection.
4. Deploy the updated project-service **and gateway**, then the frontend.
   Flyway creates the connection/state tables automatically. Set the frontend's
   `VITE_API_BASE_URL` to the gateway origin, never to a provider API.
   Keep provider secrets out of all `VITE_*` variables.
5. Sign in as a workspace owner/admin. Open Integrations, authorize a provider,
   and return to the same frontend origin/account within ten minutes.
   For localhost, register the exact callback URLs for that origin and port instead.

## Workflows

- **GitHub:** Configure → discover repositories → select one → Save repository →
  Fetch activity. Reads the most recent ten commits, pull requests, deployments,
  and workflow runs directly from GitHub. Discovery is capped at 1,000 repositories.
  Missing permissions, disabled Actions, rate limits, and provider failures are errors,
  not fabricated success or empty demo data. Repository selection is workspace-wide.
- **Slack:** Configure → Send test message. Slack must return `ok` before delivery
  is reported. Paste a reviewed investigation brief into the handoff field and send
  it to the authorized channel. Review sensitive content before sending.
  Reconnect to choose another channel. Sending is manual, not automatic.
  If a send times out, check the channel before retrying: Slack may have received
  the message even though Sherlock could not confirm delivery.
- **Disconnect:** Removes the encrypted workspace credential and pending authorization
  states. It does not revoke the external OAuth grant; revoke that in GitHub or Slack
  settings when required. One connection per provider per workspace is supported.

## Security and status

OAuth state is random, stored hashed, expires in ten minutes, and is bound to the
workspace, initiating user, and provider. Callback exchange requires the same authenticated
account and current management permissions. Credentials are encrypted with AES-256-GCM,
with tenant/provider identity authenticated as associated data. API responses never
include credentials. Slack destinations are restricted to HTTPS `hooks.slack.com`
incoming-webhook paths; HTTP redirects are not followed.

“Authorized” means the provider confirmed an OAuth exchange and Sherlock retains a
credential. It is **not** a continuous health signal. The last confirmation timestamp
updates after successful repository reads or Slack delivery. Provider revocation
is detected on the next operation. An unconfigured backend disables Connect.
Preview mode never loads or creates live connections.

## Deliberate limitations

This phase does not receive GitHub webhooks, correlate deployments with telemetry,
detect languages/architecture, run automatic incident alerts, or implement the other
catalog providers. Slack handoffs do not claim investigation conclusions are verified.
No provider credential is supplied by the repository; deployment and real-account
acceptance checks are necessary before production use.

## Verification

Run `pnpm build` in the frontend root and `mvn -B -ntp verify` in `backend`.
Tests cover state expiry/replay/user/provider binding, fail-closed setup, management
permissions, no credential leakage, delivery failure, disconnect cleanup, encryption
tenant binding, and destination restrictions. Provider test doubles do not establish
real OAuth consent or delivery; complete the setup and test with actual provider accounts.
