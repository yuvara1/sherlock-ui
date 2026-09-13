import { apiClient } from "./client";
import type { Service, ProjectMetrics } from "@/types";
import { MOCK_SERVICES, MOCK_METRICS } from "@/mocks/data";

const USE_MOCK = true;

export const servicesApi = {
  list: async (projectId: string): Promise<Service[]> => {
    if (USE_MOCK) return MOCK_SERVICES.filter(s => s.projectId === projectId);
    const { data } = await apiClient.get<Service[]>("/services", { params: { projectId } });
    return data;
  },

  metrics: async (projectId: string): Promise<ProjectMetrics> => {
    if (USE_MOCK) return MOCK_METRICS;
    const { data } = await apiClient.get<ProjectMetrics>("/metrics", { params: { projectId } });
    return data;
  },
};
