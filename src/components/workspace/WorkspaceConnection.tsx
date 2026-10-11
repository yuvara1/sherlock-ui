import { useCallback } from "react"
import { authApi } from "@/api/auth"
import { projectsApi, projectForSelector } from "@/api/projects"
import { workspaceApi } from "@/api/workspace"
import { useAuthStore } from "@/stores/authStore"
import { useAppStore } from "@/stores/appStore"
import { Button, Notice, useResource } from "./Controls"

export default function WorkspaceConnection() {
  const resource = useResource(
    useCallback(async () => {
      const accountId = useAuthStore.getState().user?.id
      const user = await authApi.me()
      if (
        !useAuthStore.getState().isAuthenticated ||
        useAuthStore.getState().user?.id !== accountId
      )
        return false
      useAuthStore.setState({ user })
      useAppStore.getState().setUser(user)
      await workspaceApi.get()
      const projects = await projectsApi.list()
      if (
        !useAuthStore.getState().isAuthenticated ||
        useAuthStore.getState().user?.id !== accountId
      )
        return false
      useAppStore
        .getState()
        .setProjects(
          projects
            .filter((project) => project.status === "ACTIVE")
            .map(projectForSelector),
        )
      return true
    }, []),
  )
  if (!resource.error) return null
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border)] bg-[var(--bg-2)] p-3">
      <div className="min-w-0 flex-1">
        <Notice message={resource.error} />
      </div>
      <Button
        disabled={resource.loading}
        onClick={() => void resource.reload()}
      >
        Retry connection
      </Button>
      <Button onClick={() => useAuthStore.getState().logout()}>Sign out</Button>
    </div>
  )
}
