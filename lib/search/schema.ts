import { z } from "zod";

/**
 * What the search agent (LLM + Sanity Context MCP tools) is allowed to emit.
 * Deliberately thin: a lesson slug (verifiable against real Sanity data) and
 * a short match description. Everything else a result card needs — title,
 * course, thumbnail, duration, module/lesson numbering — is re-fetched
 * server-side from the existing read layer in `app/api/search/route.ts`,
 * never trusted from model output. This is what keeps every result grounded
 * in real data per AGENTS.md §7/§11.
 *
 * `kind` stays a two-value enum for forward compatibility with video-moment
 * results once a `video` document type and ingestion pipeline exist (AGENTS.md
 * §9) — the system prompt instructs the model to never actually emit "video"
 * this round, and the API route drops any it emits anyway (see `hydrate.ts`).
 */
export const AgentMatchSchema = z.object({
  kind: z.enum(["lesson", "video"]),
  lessonSlug: z.string().min(1),
  description: z.string().min(1).max(240),
  /**
   * Only meaningful for kind "video", once video documents exist — `null`
   * otherwise. Nullable rather than optional because OpenAI's structured
   * output (strict JSON schema mode) requires every property to be present
   * in `required`; an optional field is rejected outright.
   */
  startSeconds: z.number().int().min(0).nullable(),
});
export type AgentMatch = z.infer<typeof AgentMatchSchema>;

export const AgentOutputSchema = z.object({
  results: z.array(AgentMatchSchema).max(60),
});
export type AgentOutput = z.infer<typeof AgentOutputSchema>;

/** The API route's response shape — fully hydrated from real Sanity data. */
export interface SearchResultLesson {
  kind: "lesson";
  lessonSlug: string;
  title: string;
  description: string;
  courseTitle: string;
  courseSlug: string;
  courseCoverImageUrl: string | null;
  moduleLabel: string;
  lessonLabel: string;
  keyPoints: string[];
}

export interface SearchResultVideo {
  kind: "video";
  lessonSlug: string;
  title: string;
  description: string;
  courseTitle: string;
  courseSlug: string;
  thumbnailUrl: string | null;
  duration: number | null;
  moduleLabel: string;
  lessonLabel: string;
  startSeconds: number;
}

export type SearchResult = SearchResultLesson | SearchResultVideo;

export interface SearchResponse {
  query: string;
  resultCount: number;
  courseCount: number;
  results: SearchResult[];
}
