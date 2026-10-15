# Sherlock UI

React, TypeScript, Vite, and Tailwind CSS v4 frontend for Sherlock, developed and maintained by [yuvara1](https://github.com/yuvara1).

## Local development

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

For same-origin development, leave `VITE_API_BASE_URL` empty and set `API_GATEWAY_URL`
to the gateway origin. Otherwise set `VITE_API_BASE_URL` to the gateway origin without
`/api/v1`; the Axios client appends that prefix. `API_GATEWAY_URL` configures Vite's dev
proxy only.

In Vercel, set `VITE_API_BASE_URL` to the deployed HTTPS gateway and configure the
gateway `ALLOWED_ORIGINS` to include `https://sherlock-in.vercel.app`. Vite variables
are embedded at build time, so redeploy after changing them. Never expose backend
secrets, JWT signing keys, service tokens, SMTP credentials, or access tokens through
frontend environment variables.

## Backend

The gateway, auth service, and project service are maintained separately in
[sherlock-api](https://github.com/yuvara1/sherlock-api). Backend Java source and Maven
modules do not belong in this frontend repository.

## Current capabilities

- Registration, login, MFA, password recovery, token refresh, and protected routes.
- Workspace initialization, project management, search, and environment selection.
- API key creation, expiry configuration, and revocation.
- Team invitations, role management, sessions, audit export, and security settings.
- Demo observability workflows for pages whose production services are not yet available.

Demo data is labeled separately from verified production evidence. Production telemetry
and investigation features require their corresponding backend services.

## Validation

```sh
pnpm exec tsc --noEmit
pnpm build
pnpm format
```

`pnpm build` produces the Vite `dist/` directory used by Vercel.
