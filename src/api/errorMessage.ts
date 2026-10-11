import axios from "axios"

export function apiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!axios.isAxiosError(error)) return fallback

  if (error.code === "ERR_INVALID_API_RESPONSE")
    return "The Sherlock backend returned an invalid API response. Check that the API URL points to the gateway, not the frontend website."

  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT")
    return "The Sherlock backend API took too long to respond. Please try again shortly."

  if (!error.response)
    return "Unable to connect to the Sherlock backend API. The server may be offline or unreachable. Check your connection and try again."

  const status = error.response.status
  if ([502, 503, 504].includes(status))
    return "The Sherlock backend service is temporarily unavailable. Please try again shortly."
  if (status >= 500)
    return "The Sherlock backend API encountered an error and could not complete your request. Please try again."
  if (status === 429)
    return "Too many requests to the Sherlock API. Please wait a moment before trying again."

  const data: unknown = error.response.data
  if (typeof data === "string" && /^\s*(?:<!doctype html|<html)/i.test(data))
    return "The Sherlock backend API returned a web page instead of an API response. Check that the API gateway is running and the API URL is configured correctly."

  if (data && typeof data === "object") {
    const problem = data as { detail?: unknown; errors?: unknown }
    if (problem.errors && typeof problem.errors === "object") {
      const fieldError = Object.values(problem.errors).find(
        (value): value is string => typeof value === "string" && value.trim().length > 0,
      )
      if (fieldError) return fieldError
    }
    if (typeof problem.detail === "string" && problem.detail.trim())
      return problem.detail
  }

  return fallback
}
