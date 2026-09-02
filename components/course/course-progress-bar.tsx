import Link from "next/link";

import { IconArrowRight } from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/progress";

/**
 * The sticky course footer.
 *
 * Progress is per-learner app state written only through a server route
 * (AGENTS.md §7), and that route does not exist yet — so this is presentational
 * and the page passes `percentComplete: 0`. The label and CTA are derived from
 * the prop, not hardcoded, so the bar is correct the moment real progress
 * arrives.
 */
export interface CourseProgressBarProps {
  /** 0–100. */
  percentComplete: number;
  firstLessonSlug: string | null;
  ctaLabel: string;
}

export function CourseProgressBar({
  percentComplete,
  firstLessonSlug,
  ctaLabel,
}: CourseProgressBarProps) {
  const percent = Math.min(100, Math.max(0, Math.round(percentComplete)));

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 pointer-events-none">
      <div className="max-w-[928px] mx-auto px-6 pb-4">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-sm border border-neutral-200 rounded-lg shadow-lg px-5 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-8">
          {/* Below sm the label and figure share a row, so the bar stays short */}
          <div className="flex items-baseline justify-between sm:flex-col sm:items-start gap-2 sm:gap-1 flex-shrink-0">
            <span className="text-small text-neutral-500">Your Progress</span>
            <span className="text-body text-neutral-500">
              <span className="font-semibold text-neutral-900">{percent}%</span>{" "}
              complete
            </span>
          </div>

          <ProgressBar
            value={percent}
            showLabel={false}
            className="flex-1 min-w-0"
          />

          {firstLessonSlug ? (
            <Link
              href={`/lessons/${firstLessonSlug}`}
              className="inline-flex items-center justify-center gap-6 h-11 sm:h-12 px-6 rounded-md bg-primary-500 text-white text-body font-medium hover:bg-primary-400 transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
            >
              {ctaLabel}
              <IconArrowRight size={16} />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex items-center justify-center gap-6 h-12 px-6 rounded-md bg-primary-500 text-white text-body font-medium opacity-50 cursor-not-allowed flex-shrink-0"
            >
              {ctaLabel}
              <IconArrowRight size={16} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
