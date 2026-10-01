import { apiClient } from "./client"
import type { Project } from "@/types"
import type { Page, ProjectInput, ProjectRecord } from "./workspace"

export function projectForSelector(project: ProjectRecord): Project {
  return { ...project, status: "UNKNOWN", serviceCount: 0, lastEventAt: "" }
}

export const projectsApi = {
  page: (
    params: {
      page?: number
      pageSize?: number
      search?: string
      status?: string
    } = {},
  ) =>
    apiClient
      .get<Page<ProjectRecord>>("/projects", { params })
      .then((response) => response.data),
  list: async (): Promise<ProjectRecord[]> => {
    const projects: ProjectRecord[] = []
    let page = 1
    let hasMore = true
    while (hasMore) {
      const response = await projectsApi.page({ page, pageSize: 100 })
      projects.push(...response.data)
      hasMore = response.hasMore
      page += 1
    }
    return projects
  },
  get: (id: string) =>
    apiClient
      .get<ProjectRecord>(`/projects/${id}`)
      .then((response) => response.data),
  create: (body: ProjectInput) =>
    apiClient
      .post<ProjectRecord>("/projects", body)
      .then((response) => response.data),
  update: (id: string, body: Partial<ProjectInput>) =>
    apiClient
      .patch<ProjectRecord>(`/projects/${id}`, body)
      .then((response) => response.data),
  delete: (id: string) => apiClient.delete(`/projects/${id}`),
}
