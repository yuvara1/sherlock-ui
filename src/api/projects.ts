import { apiClient } from "./client";
import type { Project } from "@/types";
import { MOCK_PROJECTS } from "@/mocks/data";

const USE_MOCK = true;

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    if (USE_MOCK) return MOCK_PROJECTS;
    const { data } = await apiClient.get<Project[]>("/projects");
    return data;
  },

  get: async (id: string): Promise<Project> => {
    if (USE_MOCK) return MOCK_PROJECTS.find(p => p.id === id) ?? MOCK_PROJECTS[0];
    const { data } = await apiClient.get<Project>(`/projects/${id}`);
    return data;
  },

  create: async (payload: Pick<Project, "name" | "environments">): Promise<Project> => {
    const { data } = await apiClient.post<Project>("/projects", payload);
    return data;
  },

  update: async (id: string, payload: Partial<Project>): Promise<Project> => {
    const { data } = await apiClient.patch<Project>(`/projects/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },
};
