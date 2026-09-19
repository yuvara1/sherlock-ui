import { apiClient } from "./client";
import type { LogEntry, LogFilters, PaginatedResponse } from "@/types";
import { MOCK_LOGS } from "@/mocks/data";

const USE_MOCK = true;

export const logsApi = {
  list: async (projectId: string, filters: LogFilters = {}, page = 0, pageSize = 50): Promise<PaginatedResponse<LogEntry>> => {
    if (USE_MOCK) {
      let logs = [...MOCK_LOGS];
      if (filters.search) logs = logs.filter(l => l.message.toLowerCase().includes(filters.search!.toLowerCase()));
      if (filters.level?.length) logs = logs.filter(l => filters.level!.includes(l.level));
      if (filters.service?.length) logs = logs.filter(l => filters.service!.includes(l.service));
      const start = page * pageSize;
      return { data: logs.slice(start, start + pageSize), total: logs.length, page, pageSize, hasMore: start + pageSize < logs.length };
    }
    const params = { projectId, page, pageSize, ...filters };
    const { data } = await apiClient.get<PaginatedResponse<LogEntry>>("/logs", { params });
    return data;
  },

  get: async (id: string): Promise<LogEntry> => {
    if (USE_MOCK) return MOCK_LOGS.find(l => l.id === id) ?? MOCK_LOGS[0];
    const { data } = await apiClient.get<LogEntry>(`/logs/${id}`);
    return data;
  },
};
