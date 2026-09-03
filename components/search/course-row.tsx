import Image from "next/image";

import { Badge, type BadgeVariant } from "@/components/ui/badge";

/**
 * The small course-branding row shared by both result card kinds: a tiny
 * cover tile (or the title's first letter, matching `CourseTile`'s existing
 * pattern — AGENTS.md §8 has no icon field on `course` or `category`, so
 * there's no framework-logo data to render) plus the course title and the
 * VIDEO/LESSON badge.
 */
export function CourseRow({
  courseTitle,
  courseCoverImageUrl,
  badgeVariant,
}: {
  courseTitle: string;
  courseCoverImageUrl: string | null;
  badgeVariant: BadgeVariant;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <CourseTile title={courseTitle} coverImageUrl={courseCoverImageUrl} />
        <span className="text-small text-neutral-500 truncate">{courseTitle}</span>
      </div>
      <Badge variant={badgeVariant} />
    </div>
  );
}

function CourseTile({
  title,
  coverImageUrl,
}: {
  title: string;
  coverImageUrl: string | null;
}) {
  if (!coverImageUrl) {
    return (
      <div className="flex-shrink-0 w-5 h-5 rounded bg-neutral-900 flex items-center justify-center">
        <span className="text-[0.625rem] font-bold text-white leading-none">
          {title.charAt(0)}
        </span>
      </div>
    );
  }

  return (
    <div className="relative flex-shrink-0 w-5 h-5 rounded overflow-hidden">
      <Image src={coverImageUrl} alt="" fill sizes="20px" className="object-cover" />
    </div>
  );
}
