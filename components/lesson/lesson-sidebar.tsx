"use client";

import { useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";

import { IconArrowRight, IconChevronDown, IconPlayCircle } from "@/components/ui/icons";
import { ProgressBar } from "@/components/ui/progress";
import { formatDuration } from "@/lib/format";
import { urlFor } from "@/sanity/lib/image";

import type { LessonCourseCoverImage, LessonCourseModuleLesson } from "./types";

const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

export interface SidebarModule {
  key: string;
  title: string;
  lessons: LessonCourseModuleLesson[];
}

export interface LessonSidebarProps {
  courseSlug: string;
  courseTitle: string;
  courseCoverImage: LessonCourseCoverImage | null;
  modules: SidebarModule[];
  currentModuleKey: string;
  currentLessonId: string;
}

/**
 * No real progress model exists yet (AGENTS.md §7), so nothing here is
 * fabricated: only the lesson actually being viewed is marked, and the
 * course's progress bar reads 0%.
 */
export function LessonSidebar({
  courseSlug,
  courseTitle,
  courseCoverImage,
  modules,
  currentModuleKey,
  currentLessonId,
}: LessonSidebarProps) {
  const [openKeys, setOpenKeys] = useState<string[]>([currentModuleKey]);
  const idPrefix = useId();

  const toggle = (key: string) =>
    setOpenKeys((keys) =>
      keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key],
    );

  return (
    <nav className="flex flex-col h-full" aria-label="Course content">
      <div className="p-5 border-b border-neutral-200 flex flex-col gap-4">
        <Link
          href={`/courses/${courseSlug}`}
          className="inline-flex items-center gap-2 text-body font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
        >
          <span className="rotate-180" aria-hidden="true">
            <IconArrowRight size={16} />
          </span>
          Back to course
        </Link>

        <div className="flex items-center gap-3">
          <CourseTile title={courseTitle} coverImage={courseCoverImage} />
          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
            <span className="text-body font-semibold text-neutral-900 truncate">
              {courseTitle}
            </span>
            <span className="text-small text-neutral-500">0% complete</span>
            <ProgressBar value={0} showLabel={false} />
          </div>
        </div>
      </div>

      <ul className="flex-1 overflow-y-auto list-none m-0 p-0">
        {modules.map((courseModule, index) => {
          const isOpen = openKeys.includes(courseModule.key);
          const isCurrent = courseModule.key === currentModuleKey;
          const panelId = `${idPrefix}-module-${courseModule.key}`;
          const moduleDuration = courseModule.lessons.reduce(
            (sum, lesson) => sum + (lesson.duration ?? 0),
            0,
          );

          return (
            <li
              key={courseModule.key}
              className={index > 0 ? "border-t border-neutral-200" : undefined}
            >
              <button
                type="button"
                onClick={() => {
                  if (!isOpen && isPostHogConfigured) {
                    posthog.capture("lesson_sidebar_module_expanded", {
                      course_slug: courseSlug,
                      module_position: index + 1,
                    });
                  }
                  toggle(courseModule.key);
                }}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="w-full flex items-center gap-3 text-left px-5 py-3.5 hover:bg-neutral-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-400"
              >
                <span
                  className={[
                    "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-small font-medium",
                    isCurrent
                      ? "bg-primary-500 text-white"
                      : "border border-neutral-200 bg-white text-neutral-700",
                  ].join(" ")}
                >
                  {index + 1}
                </span>

                <span className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span className="text-body font-medium text-neutral-900 truncate">
                    {courseModule.title}
                  </span>
                  {moduleDuration > 0 && (
                    <span className="text-small text-neutral-500">
                      {formatDuration(moduleDuration)}
                    </span>
                  )}
                </span>

                <span
                  className={[
                    "text-neutral-400 flex-shrink-0 transition-transform duration-200",
                    isOpen ? "rotate-180" : "",
                  ].join(" ")}
                  aria-hidden="true"
                >
                  <IconChevronDown size={18} />
                </span>
              </button>

              <div id={panelId} hidden={!isOpen}>
                <ul className="list-none m-0 pb-2 flex flex-col">
                  {courseModule.lessons.map((lesson) => {
                    const isPlaying = lesson._id === currentLessonId;
                    return (
                      <li key={lesson._id}>
                        <LessonRow lesson={lesson} isPlaying={isPlaying} />
                      </li>
                    );
                  })}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function LessonRow({
  lesson,
  isPlaying,
}: {
  lesson: LessonCourseModuleLesson;
  isPlaying: boolean;
}) {
  const body = (
    <>
      <span
        aria-hidden="true"
        className={[
          "flex-shrink-0 w-2 h-2 rounded-full",
          isPlaying ? "bg-primary-500" : "border border-neutral-300",
        ].join(" ")}
      />
      <span className="flex flex-col min-w-0 flex-1">
        <span
          className={[
            "text-body truncate",
            isPlaying ? "font-medium text-neutral-900" : "text-neutral-700",
          ].join(" ")}
        >
          {lesson.title}
        </span>
        {isPlaying ? (
          <span className="text-small text-primary-500">Now playing</span>
        ) : (
          typeof lesson.duration === "number" &&
          lesson.duration > 0 && (
            <span className="text-small text-neutral-500">
              {formatDuration(lesson.duration)}
            </span>
          )
        )}
      </span>
      {isPlaying && (
        <span
          className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-500 text-white flex items-center justify-center"
          aria-hidden="true"
        >
          <IconPlayCircle size={16} />
        </span>
      )}
    </>
  );

  if (!lesson.slug) {
    return (
      <span className="flex items-center gap-3 px-5 pl-11 py-2.5 opacity-60">
        {body}
      </span>
    );
  }

  return (
    <Link
      href={`/lessons/${lesson.slug}`}
      aria-current={isPlaying ? "true" : undefined}
      className={[
        "flex items-center gap-3 px-5 pl-11 py-2.5 transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-400",
        isPlaying ? "bg-primary-100/40" : "",
      ].join(" ")}
    >
      {body}
    </Link>
  );
}

function CourseTile({
  title,
  coverImage,
}: {
  title: string;
  coverImage: LessonSidebarProps["courseCoverImage"];
}) {
  const shell =
    "flex-shrink-0 w-10 h-10 rounded-md overflow-hidden flex items-center justify-center";

  if (!coverImage?.asset) {
    return (
      <div className={`${shell} bg-neutral-900`}>
        <span className="text-body font-bold text-white">{title.charAt(0)}</span>
      </div>
    );
  }

  return (
    <div className={`${shell} relative bg-neutral-900`}>
      <Image
        src={urlFor(coverImage).width(80).height(80).fit("crop").auto("format").url()}
        alt={coverImage.alt ?? `Cover image for ${title}`}
        fill
        sizes="40px"
        className="object-cover"
      />
    </div>
  );
}
