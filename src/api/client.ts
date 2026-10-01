import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"
import { useAuthStore } from "@/stores/authStore"

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "")
export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
})
let refreshRequest: Promise<string> | null = null

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("sherlock_access_token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  config.headers["X-Correlation-ID"] = crypto.randomUUID()
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & {
      _retry?: boolean
    }) | undefined
    const publicAuth = [
      "/auth/login",
      "/auth/login/mfa",
      "/auth/register",
      "/auth/refresh",
      "/auth/forgot-password",
      "/auth/reset-password",
    ].includes(original?.url ?? "")
    if (
      error.response?.status !== 401 ||
      !original ||
      original._retry ||
      publicAuth
    )
      return Promise.reject(error)
    original._retry = true
    const latestToken = localStorage.getItem("sherlock_access_token")
    if (latestToken && original.headers.Authorization !== `Bearer ${latestToken}`) {
      original.headers.Authorization = `Bearer ${latestToken}`
      return apiClient(original)
    }
    const accountId = useAuthStore.getState().user?.id
    try {
      if (!refreshRequest) {
        refreshRequest = (async () => {
          const refreshToken = localStorage.getItem("sherlock_refresh_token")
          if (!refreshToken) throw error
          const { data } = await axios.post<{
            accessToken: string
            refreshToken: string
          }>(`${BASE_URL}/api/v1/auth/refresh`, { refreshToken }, {
            timeout: 30_000,
          })
          if (
            !useAuthStore.getState().isAuthenticated ||
            useAuthStore.getState().user?.id !== accountId
          )
            throw error
          useAuthStore.getState().setTokens(data)
          return data.accessToken
        })().finally(() => {
          refreshRequest = null
        })
      }
      original.headers.Authorization = `Bearer ${await refreshRequest}`
      return apiClient(original)
    } catch (refreshError) {
      if (
        useAuthStore.getState().user?.id === accountId &&
        axios.isAxiosError(refreshError) &&
        [401, 403].includes(refreshError.response?.status ?? 0)
      ) {
        useAuthStore.getState().logout()
      }
      return Promise.reject(refreshError)
    }
  },
)
