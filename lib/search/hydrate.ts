import "server-only";

import { sanityFetch } from "@/sanity/lib/fetch";
import { deriveLessonPosition } from "@/sanity/lib/lesson-position";
import { urlFor } from "@/sanity/lib/image";
import { SEARCH_HYDRATE_QUERY } from "@/sanity/queries/search";

import type { AgentMatch, SearchResult, SearchResultLesson } from "./schema";
import type { SEARCH_HYDRATE_QUERY_RESULT } from "@/sanity.types";

type HydratedLesson = SEARCH_HYDRATE_QUERY_RESULT[number];

/**
 * Turns the agent's thin matches (lesson slug + description) into fully
 * grounded result cards, re-reading every other field from Sanity rather
 * than trusting model output. See `lib/search/schema.ts` for why.
 *
 * - Drops any match whose slug doesn't resolve to a real, published lesson
 *   (a hallucinated slug) or whose lesson isn't attached to any course (the
 *   lesson page itself 404s in that case — see `app/lessons/[slug]/page.tsx`).
 * - Drops "video" matches outright: no `video` document type or hydration
 *   query exists yet (AGENTS.md §9 ingestion is a separate phase). The system
 *   prompt already instructs the model never to emit one; this is the
 *   defensive backstop.
 * - Preserves the agent's ranking order — the order it returned matches in.
 */
export async function hydrateResults(matches: AgentMatch[]): Promise<SearchResult[]> {
  const lessonMatches = dedupeBySlug(matches.filter((match) => match.kind === "lesson"));
  if (lessonMatches.length === 0) return [];

  const slugs = lessonMatches.map((match) => match.lessonSlug);
  const lessons = await sanityFetch({
    query: SEARCH_HYDRATE_QUERY,
    params: { slugs },
    tags: ["lesson", "course"],
  });

  const lessonsBySlug = new Map<string, HydratedLesson>();
  for (const lesson of lessons) {
    if (lesson.slug) lessonsBySlug.set(lesson.slug, lesson);
  }

  const results: SearchResult[] = [];
  for (const match of lessonMatches) {
    const lesson = lessonsBySlug.get(match.lessonSlug);
    const result = lesson ? toLessonResult(lesson, match) : null;
    if (result) results.push(result);
  }
  return results;
}

function toLessonResult(lesson: HydratedLesson, match: AgentMatch): SearchResultLesson | null {
  const course = lesson.course;
  if (!course?.slug) return null;

  const position = deriveLessonPosition(
    (course.modules ?? []).map((courseModule) => ({
      _key: courseModule._key,
      title: courseModule.title,
      lessonIds: courseModule.lessonIds,
    })),
    lesson._id,
  );
  if (!position) return null;

  return {
    kind: "lesson",
    lessonSlug: lesson.slug!,
    title: lesson.title ?? "Untitled lesson",
    description: match.description,
    courseTitle: course.title ?? "Untitled course",
    courseSlug: course.slug,
    courseCoverImageUrl: course.coverImage
      ? urlFor(course.coverImage).width(64).height(64).fit("crop").auto("format").url()
      : null,
    moduleLabel: `Module ${position.moduleNumber}`,
    lessonLabel: position.lessonLabel,
    keyPoints: lesson.keyPoints ?? [],
  };
}

function dedupeBySlug(matches: AgentMatch[]): AgentMatch[] {
  const seen = new Set<string>();
  const deduped: AgentMatch[] = [];
  for (const match of matches) {
    if (seen.has(match.lessonSlug)) continue;
    seen.add(match.lessonSlug);
    deduped.push(match);
  }
  return deduped;
}
