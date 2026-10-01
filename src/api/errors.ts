import { apiClient } from "./client";
import type { ErrorGroup, ErrorGroupDetail, PaginatedResponse } from "@/types";
import { MOCK_ERROR_GROUPS, MOCK_ERROR_GROUP_DETAIL } from "@/mocks/data";

const USE_MOCK = true;

export const errorsApi = {
  list: async (projectId: string): Promise<PaginatedResponse<ErrorGroup>> => {
    if (USE_MOCK) return { data: MOCK_ERROR_GROUPS, total: MOCK_ERROR_GROUPS.length, page: 0, pageSize: 50, hasMore: false };
    const { data } = await apiClient.get<PaginatedResponse<ErrorGroup>>("/errors", { params: { projectId } });
    return data;
  },

  get: async (id: string): Promise<ErrorGroupDetail> => {
    if (USE_MOCK) return MOCK_ERROR_GROUP_DETAIL;
    const { data } = await apiClient.get<ErrorGroupDetail>(`/errors/${id}`);
    return data;
  },
};
