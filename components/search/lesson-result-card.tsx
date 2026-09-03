"use client";

import Link from "next/link";
import posthog from "posthog-js";

import { CourseRow } from "@/components/search/course-row";
import { IconCheckCircle, IconExternalLink } from "@/components/ui/icons";

import type { SearchResultLesson } from "@/lib/search/schema";

const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

/** A lesson matched on its own topic (title/notes/key points) — AGENTS.md §11. */
export function LessonResultCard({ result }: { result: SearchResultLesson }) {
  const previewPoints = result.keyPoints.slice(0, 3);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row gap-4 p-4">
        <KeyPointsPreview points={previewPoints} />

        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <CourseRow
            courseTitle={result.courseTitle}
            courseCoverImageUrl={result.courseCoverImageUrl}
            badgeVariant="lesson"
          />
          <h3 className="text-h2 font-semibold text-neutral-900">{result.title}</h3>
          <p className="text-body text-neutral-500 line-clamp-2">{result.description}</p>

          <div className="flex items-center justify-between gap-3 border-t border-neutral-100 pt-3 mt-1">
            <span className="text-small text-neutral-500">{result.moduleLabel}</span>
            <Link
              href={`/lessons/${result.lessonSlug}`}
              onClick={() => {
                if (!isPostHogConfigured) return;
                posthog.capture("search_result_selected", {
                  result_kind: "lesson",
                  lesson_slug: result.lessonSlug,
                });
              }}
              className="inline-flex items-center gap-1.5 text-small font-medium text-neutral-700 border border-neutral-200 rounded-md px-3 py-1.5 hover:bg-neutral-50 shadow-sm flex-shrink-0"
            >
              View lesson
              <IconExternalLink />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function KeyPointsPreview({ points }: { points: string[] }) {
  return (
    <div className="relative flex-shrink-0 w-full sm:w-52 aspect-video sm:aspect-auto sm:h-auto rounded-md bg-neutral-50 border border-neutral-100 p-3 flex flex-col gap-1.5 justify-center">
      {points.length > 0 ? (
        points.map((point, index) => (
          <div key={index} className="flex items-start gap-1.5 min-w-0">
            <span className="mt-1.5 w-1 h-1 rounded-full bg-neutral-400 flex-shrink-0" />
            <span className="text-small text-neutral-600 line-clamp-1">{point}</span>
          </div>
        ))
      ) : (
        <span className="text-small text-neutral-400">Lesson overview</span>
      )}
      <span className="absolute -bottom-2 -right-2 flex items-center justify-center w-6 h-6 rounded-full bg-white shadow-sm text-primary-500">
        <IconCheckCircle size={16} />
      </span>
    </div>
  );
}
