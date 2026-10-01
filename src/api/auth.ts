import axios from "axios"
import { apiClient } from "./client"
import type { User, AuthTokens } from "@/types"

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

/** Extracts a human-readable message from a Spring ProblemDetail error. */
export function authErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError(error)) {
    if (!error.response)
      return "Can't reach the Sherlock API gateway. Check the connection and try again."
    const data = error.response.data as {
      detail?: string
      errors?: Record<string, string>
    } | undefined
    const fieldError = data?.errors ? Object.values(data.errors)[0] : undefined
    return fieldError ?? data?.detail ?? fallback
  }
  return fallback
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<LoginResponse>("/auth/login", payload).then((r) => r.data),

  loginMfa: (mfaToken: string, code: string) =>
    apiClient
      .post<LoginResponse>("/auth/login/mfa", { mfaToken, code })
      .then((r) => r.data),

  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResponse>("/auth/register", payload).then((r) => r.data),

  logout: (refreshToken: string | null) =>
    apiClient.post("/auth/logout", { refreshToken }),

  forgotPassword: (email: string) =>
    apiClient.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post("/auth/reset-password", { token, newPassword: password }),

  me: () => apiClient.get<User>("/auth/me").then((r) => r.data),

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
