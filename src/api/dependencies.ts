import { apiClient } from "./client";
import type { DependencyGraph } from "@/types";
import { MOCK_DEPENDENCY_GRAPH } from "@/mocks/data";

const USE_MOCK = true;

export const dependenciesApi = {
  get: async (projectId: string): Promise<DependencyGraph> => {
    if (USE_MOCK) return MOCK_DEPENDENCY_GRAPH;
    const { data } = await apiClient.get<DependencyGraph>("/dependencies", { params: { projectId } });
    return data;
  },
};
