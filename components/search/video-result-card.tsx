"use client";

import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";

import { CourseRow } from "@/components/search/course-row";
import { IconPlayCircle } from "@/components/ui/icons";
import { formatDuration } from "@/lib/format";

import type { SearchResultVideo } from "@/lib/search/schema";

const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

/**
 * A lesson's video matched at a specific moment — AGENTS.md §11. Unreachable
 * until video documents with chapters/transcript chunks exist (see
 * `lib/search/hydrate.ts`); built now so the UI needs no further changes once
 * ingestion (AGENTS.md §9) ships.
 */
export function VideoResultCard({ result }: { result: SearchResultVideo }) {
  const watchFrom = formatTimestamp(result.startSeconds);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        <VideoThumbnail
          title={result.title}
          thumbnailUrl={result.thumbnailUrl}
          duration={result.duration}
        />

        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <CourseRow
            courseTitle={result.courseTitle}
            courseCoverImageUrl={null}
            badgeVariant="video"
          />
          <h3 className="text-h2 font-semibold text-neutral-900">{result.title}</h3>
          <p className="text-body text-neutral-500 line-clamp-2">{result.description}</p>

          <div className="flex items-center justify-between gap-3 border-t border-neutral-100 pt-3 mt-1">
            <span className="text-small text-neutral-500 truncate">{result.lessonLabel}</span>
            <Link
              href={`/lessons/${result.lessonSlug}?t=${result.startSeconds}`}
              onClick={() => {
                if (!isPostHogConfigured) return;
                posthog.capture("search_result_selected", {
                  result_kind: "video",
                  lesson_slug: result.lessonSlug,
                  start_seconds: result.startSeconds,
                });
              }}
              className="inline-flex items-center gap-1.5 text-small font-medium text-primary-500 hover:underline flex-shrink-0"
            >
              <IconPlayCircle />
              Watch from {watchFrom}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function VideoThumbnail({
  title,
  thumbnailUrl,
  duration,
}: {
  title: string;
  thumbnailUrl: string | null;
  duration: number | null;
}) {
  return (
    <div className="relative flex-shrink-0 w-full sm:w-52 aspect-video rounded-md overflow-hidden bg-neutral-900">
      {thumbnailUrl && (
        <Image src={thumbnailUrl} alt="" fill sizes="208px" className="object-cover" />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/90 text-neutral-900">
          <IconPlayCircle size={20} />
        </span>
      </div>
      {typeof duration === "number" && duration > 0 && (
        <span className="absolute bottom-2 right-2 text-small text-white bg-black/70 rounded px-1.5 py-0.5">
          {formatDuration(duration)}
        </span>
      )}
      <span className="sr-only">{title}</span>
    </div>
  );
}

/** "12:45" from raw seconds. */
function formatTimestamp(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
