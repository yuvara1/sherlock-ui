import { apiClient } from "./client";
import type { User, AuthTokens } from "@/types";

export interface LoginPayload { email: string; password: string }
export interface RegisterPayload { name: string; email: string; password: string; organizationName: string }

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<{ user: User; tokens: AuthTokens }>("/auth/login", payload),

  register: (payload: RegisterPayload) =>
    apiClient.post<{ user: User; tokens: AuthTokens }>("/auth/register", payload),

  logout: () => apiClient.post("/auth/logout"),

  forgotPassword: (email: string) =>
    apiClient.post("/auth/forgot-password", { email }),

  resetPassword: (token: string, password: string) =>
    apiClient.post("/auth/reset-password", { token, password }),

  me: () => apiClient.get<User>("/users/me"),
};
