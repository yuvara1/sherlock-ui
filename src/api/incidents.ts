import { apiClient } from "./client";
import type { Incident, IncidentDetail, PaginatedResponse } from "@/types";
import { MOCK_INCIDENTS, MOCK_INCIDENT_DETAIL } from "@/mocks/data";

const USE_MOCK = true;

export const incidentsApi = {
  list: async (projectId: string): Promise<PaginatedResponse<Incident>> => {
    if (USE_MOCK) return { data: MOCK_INCIDENTS, total: MOCK_INCIDENTS.length, page: 0, pageSize: 50, hasMore: false };
    const { data } = await apiClient.get<PaginatedResponse<Incident>>("/incidents", { params: { projectId } });
    return data;
  },

  get: async (id: string): Promise<IncidentDetail> => {
    if (USE_MOCK) return MOCK_INCIDENT_DETAIL;
    const { data } = await apiClient.get<IncidentDetail>(`/incidents/${id}`);
    return data;
  },
};
