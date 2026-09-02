"use client";

import Image from "next/image";
import Link from "next/link";
import posthog from "posthog-js";

import { IconBarChart, IconClock, IconGrid } from "@/components/ui/icons";
import { formatDuration, formatLevel } from "@/lib/format";
import { urlFor } from "@/sanity/lib/image";

import type { COURSES_CATALOG_QUERY_RESULT } from "@/sanity.types";

const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

/**
 * The catalog card, shared by the home page's featured row and the `/courses`
 * grid so the two cannot drift apart.
 *
 * Every meta item drops out when its value is absent rather than rendering a
 * zero the data never claimed.
 */
export type CatalogCourse = COURSES_CATALOG_QUERY_RESULT[number];

export function CourseCard({ course }: { course: CatalogCourse }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      onClick={() => {
        if (!isPostHogConfigured) return;
        posthog.capture("course_selected", {
          course_slug: course.slug,
        });
      }}
      className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 flex flex-col gap-5 hover:shadow-md transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2"
    >
      <CourseTile course={course} />

      <div className="flex flex-col gap-2 flex-1">
        <h3 className="text-h2 font-semibold text-neutral-900">
          {course.title}
        </h3>
        {course.summary && (
          <p className="text-body text-neutral-500 leading-relaxed">
            {course.summary}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 text-small text-neutral-500 border-t border-neutral-100 pt-4">
        {course.level && (
          <span className="flex items-center gap-1 whitespace-nowrap">
            <IconBarChart size={13} />
            {formatLevel(course.level)}
          </span>
        )}
        {typeof course.duration === "number" && course.duration > 0 && (
          <span className="flex items-center gap-1 whitespace-nowrap">
            <IconClock size={13} />
            {formatDuration(course.duration)}
          </span>
        )}
        {typeof course.moduleCount === "number" && course.moduleCount > 0 && (
          <span className="flex items-center gap-1 whitespace-nowrap">
            <IconGrid size={13} />
            {course.moduleCount} modules
          </span>
        )}
      </div>
    </Link>
  );
}

/* ── Cover tile ─────────────────────────────────────────────── */

function CourseTile({ course }: { course: CatalogCourse }) {
  const title = course.title ?? "Untitled course";

  if (!course.coverImage?.asset) {
    return (
      <div className="w-16 h-16 rounded-md bg-neutral-900 flex items-center justify-center">
        <span className="text-[1.75rem] font-bold text-white leading-none">
          {title.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-16 h-16 rounded-md overflow-hidden">
      <Image
        src={urlFor(course.coverImage).width(128).height(128).fit("crop").auto("format").url()}
        alt={course.coverImage.alt ?? `Cover image for ${title}`}
        fill
        sizes="64px"
        className="object-cover"
      />
    </div>
  );
}
