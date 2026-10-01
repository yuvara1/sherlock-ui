import { apiClient } from "./client"
import type { Environment } from "@/types"

export type Role = "OWNER" | "ADMIN" | "DEVELOPER" | "VIEWER"
export interface Page<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
export interface Workspace {
  id: string
  name: string
  slug: string
  plan: "FREE" | "PRO" | "ENTERPRISE"
  dataRetentionDays: number
  timezone: string
  region: string
  defaultEnvironment: Environment
  createdAt: string
}
export interface ProjectRecord {
  id: string
  organizationId: string
  name: string
  slug: string
  description: string | null
  language: string | null
  status: "ACTIVE" | "ARCHIVED"
  environments: Environment[]
  createdAt: string
}
export interface ProjectInput {
  name: string
  environments: Environment[]
  description?: string
  language?: string
  status?: "ACTIVE" | "ARCHIVED"
}
export interface ApiKeyRecord {
  id: string
  projectId: string
  organizationId: string
  name: string
  prefix: string
  environment: Environment
  status: "ACTIVE" | "REVOKED"
  expiresAt: string | null
  createdBy: string
  createdAt: string
  lastUsedAt: string | null
}
export interface CreatedKey {
  apiKey: ApiKeyRecord
  plaintext: string
}
export interface TeamMember {
  id: string
  organizationId: string
  userId: string
  email: string
  name: string
  role: Role
  joinedAt: string
}
export interface Invitation {
  id: string
  email: string
  role: Role
  status: string
  expiresAt: string
}
export interface SecuritySettings {
  organizationId: string
  samlSsoEnabled: boolean
  samlIdpMetadataUrl: string | null
  mfaEnforced: boolean
  ipAllowlist: string[]
  sessionTimeout: "H1" | "H8" | "H24" | "D7"
  auditLogEnabled: boolean
}
export interface Subscription {
  organizationId: string
  plan: string
  priceMonthly: number
  status: string
  renewsAt: string | null
}

export const workspaceApi = {
  get: () => apiClient.get<Workspace>("/org").then((response) => response.data),
  update: (
    body: Partial<Pick<Workspace, "name" | "timezone" | "dataRetentionDays" | "region" | "defaultEnvironment">>,
  ) =>
    apiClient.patch<Workspace>("/org", body).then((response) => response.data),
  delete: () => apiClient.delete("/org"),
  keys: (projectId?: string) =>
    apiClient
      .get<ApiKeyRecord[]>(
        projectId ? `/projects/${projectId}/api-keys` : "/api-keys",
      )
      .then((response) => response.data),
  createKey: (
    projectId: string,
    body: { name: string; environment: Environment; expiresAt?: string },
  ) =>
    apiClient
      .post<CreatedKey>(`/projects/${projectId}/api-keys`, body)
      .then((response) => response.data),
  revokeKey: (projectId: string, keyId: string) =>
    apiClient.delete(`/projects/${projectId}/api-keys/${keyId}`),
  team: () =>
    apiClient.get<TeamMember[]>("/team").then((response) => response.data),
  invite: (email: string, role: Role) =>
    apiClient
      .post<Invitation>("/team/invite", { email, role })
      .then((response) => response.data),
  accept: (token: string) =>
    apiClient
      .post<TeamMember>("/team/invitations/accept", { token })
      .then((response) => response.data),
  changeRole: (memberId: string, role: Role) =>
    apiClient
      .patch<TeamMember>(`/team/${memberId}/role`, { role })
      .then((response) => response.data),
  removeMember: (memberId: string) => apiClient.delete(`/team/${memberId}`),
  security: () =>
    apiClient
      .get<SecuritySettings>("/org/security")
      .then((response) => response.data),
  updateSecurity: (body: Partial<SecuritySettings>) =>
    apiClient
      .patch<SecuritySettings>("/org/security", body)
      .then((response) => response.data),
  subscription: () =>
    apiClient
      .get<Subscription>("/org/subscription")
      .then((response) => response.data),
  upgrade: (plan: "PRO" | "ENTERPRISE") =>
    apiClient
      .post<{ url: string }>("/org/subscription/upgrade", { plan })
      .then((response) => response.data),
  auditExport: () =>
    apiClient
      .get<Blob>("/org/audit-log/export", { responseType: "blob" })
      .then((response) => response.data),
}
