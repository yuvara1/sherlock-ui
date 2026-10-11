import { apiClient } from "./client"
import { apiErrorMessage } from "./errorMessage"
import type { User, AuthTokens } from "@/types"
import { AxiosError, type AxiosResponse } from "axios"
import { z } from "zod"

const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(["OWNER", "ADMIN", "DEVELOPER", "MEMBER", "VIEWER"]),
  organizationId: z.string().uuid(),
  mfaEnabled: z.boolean(),
  avatarUrl: z.string().nullable().optional().transform((value) => value ?? undefined),
  createdAt: z.string().min(1),
})
const tokenSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.number().positive(),
})
const authSchema = z.object({ user: userSchema, tokens: tokenSchema })
const loginResponseSchema = z.object({
  user: userSchema.nullable(),
  tokens: tokenSchema.nullable(),
  mfaPending: z.boolean(),
  mfaToken: z.string().nullable(),
}).refine((value) => value.mfaPending
  ? !!value.mfaToken && value.user === null && value.tokens === null
  : value.user !== null && value.tokens !== null)

function validated<T>(response: AxiosResponse<unknown>, schema: z.ZodType<T>): T {
  const result = schema.safeParse(response.data)
  if (!result.success) {
    throw new AxiosError("Invalid authentication API response.", "ERR_INVALID_API_RESPONSE",
      response.config, response.request, response)
  }
  return result.data
}

export interface LoginPayload {
  email: string
  password: string
}
export interface RegisterPayload {
  name: string
  email: string
  password: string
  organizationName: string
}

export interface LoginResponse {
  user: User | null
  tokens: AuthTokens | null
  mfaPending: boolean
  mfaToken: string | null
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}
export interface SessionInfo {
  id: string
  deviceInfo: string
  ipAddress: string
  createdAt: string
  expiresAt: string
  current: boolean
}

export const authErrorMessage = apiErrorMessage

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<LoginResponse>("/auth/login", payload).then((response) => validated(response, loginResponseSchema)),

  loginMfa: (mfaToken: string, code: string) =>
    apiClient
      .post<LoginResponse>("/auth/login/mfa", { mfaToken, code })
      .then((response) => validated(response, loginResponseSchema)),

  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResponse>("/auth/register", payload).then((response) => validated(response, authSchema)),

  logout: (refreshToken: string | null) =>
    apiClient.post("/auth/logout", { refreshToken }),

  forgotPassword: (email: string) =>
    apiClient.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post("/auth/reset-password", { token, newPassword: password }),

  me: () => apiClient.get<User>("/auth/me").then((response) => validated(response, userSchema)),

  sessions: () =>
    apiClient.get<SessionInfo[]>("/auth/sessions").then((r) => r.data),

  revokeSession: (id: string) => apiClient.delete(`/auth/sessions/${id}`),
  enableMfa: () =>
    apiClient
      .post<{ secret: string; otpAuthUrl: string }>("/auth/mfa/enable")
      .then((response) => response.data),
  verifyMfa: (code: string) => apiClient.post("/auth/mfa/verify", { code }),
  disableMfa: (password: string, code: string) =>
    apiClient.delete("/auth/mfa", { data: { password, code } }),
}
