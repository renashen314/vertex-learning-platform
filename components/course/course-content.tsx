"use client";

import { useId, useState } from "react";
import Link from "next/link";

import { IconChevronDown, IconPlayCircle } from "@/components/ui/icons";
import { formatDuration } from "@/lib/format";

/**
 * The module list. This is the only client component on the course page — it
 * exists because expanding a module is state, and nothing else here is.
 *
 * Props are plain serialisable values: no image builder, no Sanity client, and
 * no token crosses this boundary.
 */

/** Only the modules shown before the "Show all" control is used. */
const COLLAPSED_MODULE_COUNT = 6;

export interface ContentLesson {
  id: string;
  title: string;
  slug: string | null;
  duration: number | null;
  freePreview: boolean;
}

export interface ContentModule {
  key: string;
  title: string;
  summary: string | null;
  duration: number | null;
  lessons: ContentLesson[];
}

export interface CourseContentProps {
  modules: ContentModule[];
  /** Total course duration in seconds, summed from its lessons. */
  duration: number | null;
}

export function CourseContent({ modules, duration }: CourseContentProps) {
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const idPrefix = useId();

  if (modules.length === 0) return null;

  const hasOverflow = modules.length > COLLAPSED_MODULE_COUNT;
  const visible =
    hasOverflow && !showAll
      ? modules.slice(0, COLLAPSED_MODULE_COUNT)
      : modules;

  const toggle = (key: string) =>
    setOpenKeys((keys) =>
      keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key],
    );

  return (
    <section aria-labelledby="course-content">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-6">
        <h2
          id="course-content"
          className="text-h1 font-semibold text-neutral-900"
        >
          Course Content
        </h2>
        <p className="text-body text-neutral-500">
          {modules.length} {modules.length === 1 ? "module" : "modules"}
          {typeof duration === "number" && duration > 0 && (
            <> &middot; {formatDuration(duration)}</>
          )}
        </p>
      </div>

      <ul className="bg-white/60 border border-neutral-200 rounded-lg list-none m-0 p-0 overflow-hidden">
        {visible.map((courseModule, index) => {
          const isOpen = openKeys.includes(courseModule.key);
          const panelId = `${idPrefix}-module-${courseModule.key}`;

          return (
            <li
              key={courseModule.key}
              className={
                index > 0 ? "border-t border-neutral-200" : undefined
              }
            >
              <button
                type="button"
                onClick={() => toggle(courseModule.key)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full flex items-center gap-4 sm:gap-5 text-left px-4 sm:px-6 py-4 hover:bg-white/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-400"
              >
                <ModuleNumber
                  number={index + 1}
                  isFirst={index === 0}
                  isLast={index === visible.length - 1}
                />

                <span className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span className="text-h3 font-semibold text-neutral-900">
                    {courseModule.title}
                  </span>
                  {courseModule.summary && (
                    <span className="text-body text-neutral-500">
                      {courseModule.summary}
                    </span>
                  )}
                </span>

                {typeof courseModule.duration === "number" &&
                  courseModule.duration > 0 && (
                    <span className="text-body text-neutral-500 whitespace-nowrap hidden sm:inline">
                      {formatDuration(courseModule.duration)}
                    </span>
                  )}

                <span
                  className={[
                    "text-neutral-500 flex-shrink-0 transition-transform duration-200",
                    isOpen ? "rotate-180" : "",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <IconChevronDown size={20} />
                </span>
              </button>

              <div id={panelId} hidden={!isOpen}>
                <ul className="list-none m-0 pl-4 sm:pl-6 pr-4 sm:pr-6 pb-5 flex flex-col gap-1">
                  {courseModule.lessons.map((lesson, lessonIndex) => (
                    <LessonRow
                      key={lesson.id}
                      lesson={lesson}
                      label={`Lesson ${index + 1}.${lessonIndex + 1}`}
                    />
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>

      {hasOverflow && !showAll && (
        <div className="flex justify-center -mt-5 relative">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-3 h-11 px-6 rounded-md bg-white border border-neutral-200 shadow-sm text-body font-medium text-neutral-900 hover:bg-neutral-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            Show all {modules.length} modules
            <IconChevronDown size={18} />
          </button>
        </div>
      )}
    </section>
  );
}

/* ── Numbered circle with its connector line ────────────────── */

function ModuleNumber({
  number,
  isFirst,
  isLast,
}: {
  number: number;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <span className="relative flex-shrink-0 w-9 self-stretch flex items-center justify-center">
      {/* The connector stops at the first and last rows rather than running
          off the ends of the list. */}
      {!isFirst && (
        <span
          aria-hidden="true"
          className="absolute top-0 bottom-1/2 left-1/2 -translate-x-1/2 w-px bg-neutral-200 -mt-4"
        />
      )}
      {!isLast && (
        <span
          aria-hidden="true"
          className="absolute top-1/2 bottom-0 left-1/2 -translate-x-1/2 w-px bg-neutral-200 -mb-4"
        />
      )}
      <span className="relative w-9 h-9 rounded-full border border-neutral-200 bg-white flex items-center justify-center text-body font-medium text-neutral-700">
        {number}
      </span>
    </span>
  );
}

/* ── Lesson row inside an expanded module ───────────────────── */

function LessonRow({
  lesson,
  label,
}: {
  lesson: ContentLesson;
  label: string;
}) {
  const body = (
    <>
      <span className="text-neutral-400 flex-shrink-0" aria-hidden="true">
        <IconPlayCircle size={16} />
      </span>
      <span className="text-small text-neutral-500 whitespace-nowrap flex-shrink-0 w-20">
        {label}
      </span>
      <span className="text-body text-neutral-900 flex-1 min-w-0">
        {lesson.title}
      </span>
      {lesson.freePreview && (
        <span className="text-small font-medium uppercase tracking-wide text-primary-500 bg-primary-100 rounded-sm px-2 py-0.5 flex-shrink-0">
          Free
        </span>
      )}
      {typeof lesson.duration === "number" && lesson.duration > 0 && (
        <span className="text-small text-neutral-500 whitespace-nowrap flex-shrink-0">
          {formatDuration(lesson.duration)}
        </span>
      )}
    </>
  );

  return (
    <li>
      {lesson.slug ? (
        <Link
          href={`/lessons/${lesson.slug}`}
          className="flex items-center gap-3 rounded-md px-4 sm:px-5 py-3 ml-0 sm:ml-14 hover:bg-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        >
          {body}
        </Link>
      ) : (
        <span className="flex items-center gap-3 px-4 sm:px-5 py-3 ml-0 sm:ml-14 opacity-60">
          {body}
        </span>
      )}
    </li>
  );
}
