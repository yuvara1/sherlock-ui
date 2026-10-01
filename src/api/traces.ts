import { apiClient } from "./client";
import type { Trace, TraceSummary, PaginatedResponse } from "@/types";
import { MOCK_TRACE, MOCK_TRACE_SUMMARIES } from "@/mocks/data";

const USE_MOCK = true;

export const tracesApi = {
  list: async (projectId: string): Promise<PaginatedResponse<TraceSummary>> => {
    if (USE_MOCK) return { data: MOCK_TRACE_SUMMARIES, total: MOCK_TRACE_SUMMARIES.length, page: 0, pageSize: 50, hasMore: false };
    const { data } = await apiClient.get<PaginatedResponse<TraceSummary>>("/traces", { params: { projectId } });
    return data;
  },

  get: async (traceId: string): Promise<Trace> => {
    if (USE_MOCK) return MOCK_TRACE;
    const { data } = await apiClient.get<Trace>(`/traces/${traceId}`);
    return data;
  },
};
