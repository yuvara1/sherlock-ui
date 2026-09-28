import { apiClient } from "./client";
import type { AiMessage, AiAnalysis } from "@/types";
import { MOCK_AI_CONVERSATION } from "@/mocks/data";

const USE_MOCK = true;

export const aiApi = {
  chat: async (projectId: string, message: string, history: AiMessage[]): Promise<AiMessage> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 1200));
      return {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content:
          "Based on the current telemetry data, I can see elevated error rates across your database-connected services. " +
          "The pattern is consistent with **connection pool saturation** — PostgreSQL is at capacity (100/100 connections).\n\n" +
          "The cascade follows: `postgresql → inventory-service → payment-service → order-service → api-gateway`.\n\n" +
          "**Immediate action:** Run `SELECT count(*), state FROM pg_stat_activity GROUP BY state;` to assess live connections.",
        timestamp: new Date().toISOString(),
        evidence: ["12,843 SQLTransientConnectionException in last 90 min", "PostgreSQL at max_connections limit"],
        confidence: 0.91,
        recommendedActions: ["Add PgBouncer", "Kill idle connections", "Increase max_connections"],
      };
    }
    const { data } = await apiClient.post<AiMessage>("/ai/analyze", { projectId, message, history });
    return data;
  },

  analyze: async (projectId: string, incidentId: string): Promise<AiAnalysis> => {
    if (USE_MOCK) {
      await new Promise(r => setTimeout(r, 800));
      return {
        summary: "PostgreSQL connection pool exhaustion causing cascade failure across 4 services.",
        evidence: ["8,423 HikariCP timeout errors", "P95 latency 220ms → 2.1s", "DB connections at 100/100"],
        rootCause: "PostgreSQL max_connections (100) exhausted",
        confidence: 0.91,
        recommendedActions: ["Add PgBouncer", "Review HikariCP pool settings", "Kill long-running queries"],
        disclaimer: "This is an AI-generated analysis based on observed telemetry. Confidence scores reflect pattern matching, not certainty.",
      };
    }
    const { data } = await apiClient.post<AiAnalysis>(`/ai/analyze`, { projectId, incidentId });
    return data;
  },

  getSampleConversation: (): AiMessage[] => MOCK_AI_CONVERSATION,
};
