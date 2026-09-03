"use client";

import Link from "next/link";
import posthog from "posthog-js";
import { useEffect, useMemo, useState } from "react";

import { LessonResultCard } from "@/components/search/lesson-result-card";
import { VideoResultCard } from "@/components/search/video-result-card";
import { Select } from "@/components/ui/input";
import { IconSearch } from "@/components/ui/icons";

import type { SearchResponse, SearchResult } from "@/lib/search/schema";

const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

type SortOrder = "relevant" | "title";

const SORT_OPTIONS = [
  { value: "relevant", label: "Most Relevant" },
  { value: "title", label: "Title (A–Z)" },
];

/** Tagged with the query it answers, so a response for a stale query is never rendered. */
type FetchResult =
  | { query: string; status: "error" }
  | { query: string; status: "success"; data: SearchResponse };

export function SearchResults({ query }: { query: string }) {
  const [result, setResult] = useState<FetchResult | null>(null);
  const [sort, setSort] = useState<SortOrder>("relevant");

  useEffect(() => {
    if (!query) return;

    let cancelled = false;

    fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Search failed: ${res.status}`);
        return (await res.json()) as SearchResponse;
      })
      .then((data) => {
        if (cancelled) return;
        setResult({ query, status: "success", data });
        if (isPostHogConfigured) {
          posthog.capture("search_performed", {
            query_length: data.query.length,
            result_count: data.resultCount,
          });
        }
      })
      .catch(() => {
        if (!cancelled) setResult({ query, status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  const sortedResults = useMemo(() => {
    if (result?.query !== query || result.status !== "success") return [];
    return sortResults(result.data.results, sort);
  }, [result, query, sort]);

  if (!query) {
    return <PromptState />;
  }

  const isLoading = result?.query !== query;

  if (isLoading) {
    return <LoadingState />;
  }

  if (result.status === "error") {
    return <ErrorState query={query} />;
  }

  if (result.data.resultCount === 0) {
    return <EmptyState query={query} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-body-lg text-neutral-900 font-medium">
          {result.data.resultCount} {result.data.resultCount === 1 ? "result" : "results"}
        </p>
        <div className="w-48">
          <Select
            options={SORT_OPTIONS}
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOrder)}
            aria-label="Sort results"
          />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {sortedResults.map((result) =>
          result.kind === "video" ? (
            <VideoResultCard key={`${result.lessonSlug}-${result.startSeconds}`} result={result} />
          ) : (
            <LessonResultCard key={result.lessonSlug} result={result} />
          ),
        )}
      </div>

      <CatalogFooterBand />
    </div>
  );
}

function sortResults(results: SearchResult[], sort: SortOrder): SearchResult[] {
  if (sort === "relevant") return results;
  return [...results].sort((a, b) => a.title.localeCompare(b.title));
}

/* ── States ─────────────────────────────────────────────────── */

function PromptState() {
  return (
    <div className="flex flex-col items-center gap-2 text-center py-16">
      <IconSearch size={32} className="text-neutral-300" />
      <p className="text-body-lg text-neutral-500">
        Search for a topic to find matching lessons.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-neutral-200 p-4 h-40 animate-pulse"
        />
      ))}
    </div>
  );
}

function ErrorState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center py-16 bg-white/60 border border-neutral-200 rounded-lg">
      <p className="text-body-lg text-neutral-900">Search is temporarily unavailable.</p>
      <p className="text-body text-neutral-500">Please try again in a moment.</p>
      <Link
        href={`/search?q=${encodeURIComponent(query)}`}
        className="text-body font-medium text-primary-500 hover:underline"
      >
        Retry
      </Link>
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center py-16 bg-white/60 border border-neutral-200 rounded-lg">
      <IconSearch size={28} className="text-neutral-300" />
      <p className="text-body-lg text-neutral-900">No results for &ldquo;{query}&rdquo;</p>
      <p className="text-body text-neutral-500">
        Try different keywords or browse our full course catalog.
      </p>
      <Link
        href="/courses"
        className="mt-2 inline-flex items-center gap-2 text-small font-medium text-white bg-primary-500 hover:bg-primary-400 rounded-md px-4 py-2"
      >
        Browse all courses
      </Link>
    </div>
  );
}

function CatalogFooterBand() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-primary-100/40 border border-primary-100 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <span className="flex-shrink-0 w-9 h-9 rounded-full bg-white flex items-center justify-center text-primary-500 shadow-sm">
          <IconSearch size={16} />
        </span>
        <div>
          <p className="text-body font-medium text-neutral-900">
            Can&apos;t find what you&apos;re looking for?
          </p>
          <p className="text-small text-neutral-500">
            Try different keywords or browse our full course catalog.
          </p>
        </div>
      </div>
      <Link
        href="/courses"
        className="flex-shrink-0 inline-flex items-center gap-2 text-small font-medium text-neutral-700 bg-white border border-neutral-200 rounded-md px-4 py-2 hover:bg-neutral-50 shadow-sm"
      >
        Browse all courses
      </Link>
    </div>
  );
}
