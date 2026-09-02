import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  IconArrowRight,
  IconBarChart,
  IconBookmark,
  IconClock,
  IconFile,
  IconUsers,
} from "@/components/ui/icons";
import { formatDuration, formatLevel, formatStudentCount } from "@/lib/format";
import { urlFor } from "@/sanity/lib/image";

import type { CourseCoverImage } from "./types";

export interface CourseHeroProps {
  title: string;
  summary: string | null;
  coverImage: CourseCoverImage | null;
  popular: boolean | null;
  level: string | null;
  /** Total course duration in seconds, summed from its lessons. */
  duration: number | null;
  moduleCount: number | null;
  studentCount: number | null;
  /** First lesson of the course, or null when it has none yet. */
  firstLessonSlug: string | null;
  ctaLabel: string;
}

export function CourseHero({
  title,
  summary,
  coverImage,
  popular,
  level,
  duration,
  moduleCount,
  studentCount,
  firstLessonSlug,
  ctaLabel,
}: CourseHeroProps) {
  const levelLabel = formatLevel(level);
  const students = formatStudentCount(studentCount);

  return (
    <section className="flex flex-col md:flex-row md:items-start gap-8 md:gap-14">
      <CourseCover title={title} coverImage={coverImage} />

      <div className="flex flex-col gap-5 min-w-0 flex-1">
        {popular && (
          <div>
            <Badge variant="popular" />
          </div>
        )}

        <h1 className="font-display text-[2.5rem] sm:text-display-1 leading-tight font-bold text-neutral-900">
          {title}
        </h1>

        {summary && (
          <p className="text-body-lg text-neutral-500 leading-relaxed max-w-xl">
            {summary}
          </p>
        )}

        {/* Meta row — every item is dropped when its value is absent */}
        <ul className="flex flex-wrap items-center gap-x-8 gap-y-3 list-none m-0 p-0 mt-2 text-body text-neutral-500">
          {levelLabel && (
            <MetaItem icon={<IconBarChart />}>{levelLabel}</MetaItem>
          )}
          {typeof duration === "number" && duration > 0 && (
            <MetaItem icon={<IconClock />}>{formatDuration(duration)}</MetaItem>
          )}
          {typeof moduleCount === "number" && moduleCount > 0 && (
            <MetaItem icon={<IconFile />}>
              {moduleCount} {moduleCount === 1 ? "module" : "modules"}
            </MetaItem>
          )}
          {students && (
            <MetaItem icon={<IconUsers />}>{students} students</MetaItem>
          )}
        </ul>

        <div className="flex flex-col sm:flex-row gap-3 mt-3">
          {firstLessonSlug ? (
            <Link
              href={`/lessons/${firstLessonSlug}`}
              className="inline-flex items-center justify-center sm:justify-between gap-8 h-13 px-6 rounded-md bg-primary-500 text-white text-body-lg font-medium hover:bg-primary-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
            >
              {ctaLabel}
              <IconArrowRight size={18} />
            </Link>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex items-center justify-center gap-8 h-13 px-6 rounded-md bg-primary-500 text-white text-body-lg font-medium opacity-50 cursor-not-allowed"
            >
              {ctaLabel}
              <IconArrowRight size={18} />
            </span>
          )}

          {/* Presentational only — bookmarks have no backend (AGENTS.md §7) */}
          <button
            type="button"
            aria-label={`Bookmark ${title}`}
            className="inline-flex items-center justify-center gap-2.5 h-13 px-6 rounded-md bg-white border border-neutral-200 shadow-sm text-body-lg font-medium text-neutral-900 hover:bg-neutral-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
          >
            <IconBookmark size={18} />
            Bookmark
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── Cover tile ─────────────────────────────────────────────── */

function CourseCover({
  title,
  coverImage,
}: {
  title: string;
  coverImage: CourseCoverImage | null;
}) {
  const shell =
    "relative w-full max-w-[280px] md:w-[280px] md:flex-shrink-0 aspect-[28/33] rounded-lg overflow-hidden shadow-md";

  if (!coverImage?.asset) {
    return (
      <div
        className={`${shell} bg-neutral-900 flex items-center justify-center`}
      >
        <span className="font-display text-[6rem] leading-none font-bold text-white">
          {title.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <div className={shell}>
      <Image
        src={urlFor(coverImage).width(560).height(660).fit("crop").auto("format").url()}
        alt={coverImage.alt ?? `Cover image for ${title}`}
        fill
        sizes="(max-width: 768px) 280px, 280px"
        className="object-cover"
        priority
      />
    </div>
  );
}

/* ── Meta item ──────────────────────────────────────────────── */

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
