# Sherlock UI

React, TypeScript, Vite, and Tailwind CSS v4 frontend for Sherlock.

## Service integration

The gateway (8080), auth-service (8081), and project-service (8082) are maintained in
[sherlock-api](https://github.com/yuvara1/sherlock-api). Backend Java source and Maven
modules do not belong in the frontend repository.

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

For same-origin development, leave `VITE_API_BASE_URL` empty and set `API_GATEWAY_URL`
to the gateway origin. Otherwise set `VITE_API_BASE_URL` to the gateway origin, without
`/api/v1`; the Axios client appends that prefix. `API_GATEWAY_URL` configures Vite's dev
proxy only. In Vercel, set `VITE_API_BASE_URL` to your deployed **HTTPS gateway** and
configure gateway `ALLOWED_ORIGINS` to include `https://sherlock-in.vercel.app`.
Vite variables are embedded at build time: redeploy after changing them. No backend
secrets, JWT signing keys, internal service tokens, SMTP credentials, or PATs are frontend
environment variables. An actual deployed backend URL is required for production use.

## Live features

- Registration, login/MFA login, password recovery/reset, token refresh and route protection.
- Workspace initialization, project picker, project creation/edit/archive/delete and search.
- Workspace settings, team invitations, role updates and removal.
- API-key creation (one-time plaintext), environment/expiry selection, and revocation.
- Workspace security settings, audit CSV export, and subscription reads.
- Account session management, MFA enrollment/disable, and server-side logout.
- `/invite?token=…` acceptance; login/register preserve the invitation return path.

Project listing unwraps paged backend responses and follows all pages. ACTIVE/ARCHIVED
project lifecycle is separate from telemetry health. API keys preserve `demo_live_` /
`demo_test_` and are never cached in localStorage. Tokens retain the existing
`sherlock_access_token` / `sherlock_refresh_token` keys; persisted stores retain
`elora-auth` / `elora-app-store`. Concurrent 401s share a single refresh request.
Projects and authentication state are cleared on logout/account changes.

Invitations need working SMTP. Billing checkout and SAML return explicit unconfigured
errors until providers are installed. Workspace policies are currently enforced only
by project-service. Other observability pages remain demo views until their respective
services exist; they are not presented as validated live telemetry.

## Validation and publication

`pnpm exec tsc --noEmit` checks types. `pnpm run build` produces Vite's static `dist/`
for Vercel; in the supervised environment, use `figma make verify-deploy` to validate
the deployment build without publishing. Imported prose under `src/imports/pasted_text`
is excluded from application type checking. Existing unrelated shared component type
errors remain (46 in the current baseline); the production build does not perform a
TypeScript check. No errors are reported in the updated workspace integration files.

The deployment build and all 31 backend Maven tests pass. Chromium integration was
verified against all three production-profile service jars with actual PostgreSQL and
Redis, plus a local SMTP capture server: registration/login, projects, one-time API keys
and gateway validation/revocation, settings, invitation acceptance, membership/session
revocation, audit export, concurrent token refresh, MFA enrollment/login/disable, logout,
and mobile layout. These are local integration results, not a production deployment claim.

Frontend GitHub publication uses a fresh orphan snapshot pushed with a force-with-lease
to `sherlock-ui/staging` because the frontend history is corrupted. Backend publication
preserves the existing backend history and uses a normal push to `sherlock-api/staging`.
Neither publication modifies `main`. Keep real `.env` files, build
output, platform cache files, and secrets out of both exports. Authenticate using a fresh
secure GitHub CLI/credential-manager session; never paste a PAT into chat or reuse the
previously exposed credential.
