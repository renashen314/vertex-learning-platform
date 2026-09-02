"use client";

import Link from "next/link";
import posthog from "posthog-js";

import { IconArrowRight } from "@/components/ui/icons";
import { formatDuration } from "@/lib/format";

const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

export interface LessonFooterNavNeighbor {
  slug: string;
  title: string;
  duration: number | null;
}

export interface LessonFooterNavProps {
  courseSlug: string;
  previous: LessonFooterNavNeighbor | null;
  next: LessonFooterNavNeighbor | null;
}

/**
 * Static, full-bleed footer bar — not the course page's floating sticky
 * card. Nothing is fixed over content, so no bottom padding reservation is
 * needed.
 */
export function LessonFooterNav({ courseSlug, previous, next }: LessonFooterNavProps) {
  const capture = (direction: "previous" | "next", slug: string) => {
    if (!isPostHogConfigured) return;
    posthog.capture("lesson_selected", {
      course_slug: courseSlug,
      lesson_slug: slug,
      source: `lesson_footer_${direction}`,
    });
  };

  return (
    <div className="border-t border-neutral-200 bg-white px-6 py-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {previous ? (
          <Link
            href={`/lessons/${previous.slug}`}
            onClick={() => capture("previous", previous.slug)}
            className="flex items-center gap-3 min-w-0 group focus-visible:outline-none"
          >
            <span className="flex-shrink-0 inline-flex items-center justify-center w-11 h-11 rounded-md border border-neutral-200 text-neutral-500 group-hover:bg-neutral-50 group-focus-visible:ring-2 group-focus-visible:ring-primary-400 transition-colors">
              <span className="rotate-180" aria-hidden="true">
                <IconArrowRight size={18} />
              </span>
            </span>
            <span className="flex flex-col text-left min-w-0">
              <span className="text-body font-medium text-neutral-900 truncate">
                {previous.title}
              </span>
              {typeof previous.duration === "number" && previous.duration > 0 && (
                <span className="text-small text-neutral-500">
                  {formatDuration(previous.duration)}
                </span>
              )}
            </span>
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}

        {next ? (
          <Link
            href={`/lessons/${next.slug}`}
            onClick={() => capture("next", next.slug)}
            className="flex items-center gap-3 min-w-0 sm:justify-end sm:self-end"
          >
            <span className="flex flex-col text-right min-w-0">
              <span className="text-body font-medium text-neutral-900 truncate">
                {next.title}
              </span>
              {typeof next.duration === "number" && next.duration > 0 && (
                <span className="text-small text-neutral-500">
                  {formatDuration(next.duration)}
                </span>
              )}
            </span>
            <span className="flex-shrink-0 inline-flex items-center gap-2 h-11 px-5 rounded-md bg-primary-500 text-white text-body font-medium hover:bg-primary-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1">
              Next Lesson
              <IconArrowRight size={16} />
            </span>
          </Link>
        ) : (
          <span aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
