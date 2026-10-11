import { apiClient } from "./client"

export type Provider = "github" | "slack"
export interface Connection {
  provider: Provider
  configured: boolean
  connected: boolean
  account?: string
  repository?: string | null
  verifiedAt?: string
}
export interface ActivityItem {
  id?: number
  sha?: string
  html_url?: string
  name?: string
  title?: string
  conclusion?: string | null
  status?: string
  environment?: string
  ref?: string
  commit?: { message?: string }
}
export interface RepositoryActivity {
  repository: string
  commits: ActivityItem[]
  pullRequests: ActivityItem[]
  deployments: ActivityItem[]
  workflowRuns: ActivityItem[]
}
export const integrationsApi = {
  list: async () => (await apiClient.get<Connection[]>("/integrations")).data,
  authorize: async (provider: Provider) =>
    (
      await apiClient.post<{ url: string }>(
        `/integrations/${provider}/authorize`,
      )
    ).data,
  complete: async (provider: Provider, code: string, state: string) =>
    (
      await apiClient.post<{ connected: boolean }>(
        `/integrations/${provider}/callback`,
        {
          code,
          state,
        },
      )
    ).data,
  disconnect: async (provider: Provider) =>
    apiClient.delete(`/integrations/${provider}`),
  repositories: async () =>
    (await apiClient.get<string[]>("/integrations/github/repositories")).data,
  selectRepository: async (repository: string) =>
    apiClient.put("/integrations/github/repository", { repository }),
  activity: async () =>
    (await apiClient.get<RepositoryActivity>("/integrations/github/activity"))
      .data,
  send: async (text: string) =>
    (
      await apiClient.post<{ delivered: boolean }>(
        "/integrations/slack/messages",
        { text },
      )
    ).data,
}
