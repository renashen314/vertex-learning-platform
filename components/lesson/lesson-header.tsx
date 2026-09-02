"use client";

import posthog from "posthog-js";

import { IconBarChart, IconBookmark, IconClock, IconUsers } from "@/components/ui/icons";
import { formatDuration, formatLevel, formatStudentCount } from "@/lib/format";

const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

export interface LessonHeaderProps {
  lessonSlug: string;
  /** e.g. "Lesson 5.1" — rendered upper-cased in the pill. */
  lessonLabel: string;
  title: string;
  summary: string | null;
  level: string | null;
  duration: number | null;
  studentCount: number | null;
}

export function LessonHeader({
  lessonSlug,
  lessonLabel,
  title,
  summary,
  level,
  duration,
  studentCount,
}: LessonHeaderProps) {
  const levelLabel = formatLevel(level);
  const students = formatStudentCount(studentCount);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-sm bg-primary-100 text-primary-500 text-small font-medium uppercase tracking-wide">
          {lessonLabel}
        </span>

        {/* Presentational only — bookmarks have no backend (AGENTS.md §7) */}
        <button
          type="button"
          aria-label={`Bookmark ${title}`}
          onClick={() => {
            if (!isPostHogConfigured) return;
            posthog.capture("lesson_bookmarked", { lesson_slug: lessonSlug });
          }}
          className="flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-md bg-white border border-neutral-200 shadow-sm text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        >
          <IconBookmark size={18} />
        </button>
      </div>

      <h1 className="font-display text-[2rem] sm:text-display-1 leading-tight font-bold text-neutral-900">
        {title}
      </h1>

      {summary && (
        <p className="text-body-lg text-neutral-500 leading-relaxed max-w-2xl">
          {summary}
        </p>
      )}

      <ul className="flex flex-wrap items-center gap-x-8 gap-y-2 list-none m-0 p-0 text-body text-neutral-500">
        {typeof duration === "number" && duration > 0 && (
          <MetaItem icon={<IconClock />}>{formatDuration(duration)}</MetaItem>
        )}
        {levelLabel && <MetaItem icon={<IconBarChart />}>{levelLabel}</MetaItem>}
        {students && <MetaItem icon={<IconUsers />}>{students} students</MetaItem>}
      </ul>
    </section>
  );
}

function MetaItem({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-2 whitespace-nowrap">
      <span className="text-neutral-500" aria-hidden="true">
        {icon}
      </span>
      {children}
    </li>
  );
}
