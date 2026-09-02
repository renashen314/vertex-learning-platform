import { Badge } from "@/components/ui/badge";
import {
  IconBarChart,
  IconClock,
  IconExternalLink,
  IconFileText,
  IconGrid,
  IconPlayCircle,
} from "@/components/ui/icons";

const cardBase =
  "bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden";

/* ── CourseCard ─────────────────────────────────────────────── */

export interface CourseCardProps {
  initial: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  modules: number;
}

export function CourseCard({
  initial,
  title,
  description,
  level,
  duration,
  modules,
}: CourseCardProps) {
  return (
    <div className={`${cardBase} p-4 flex flex-col gap-3`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-16 h-16 rounded-md bg-neutral-900 flex items-center justify-center">
          <span className="text-h2 font-bold text-white">{initial}</span>
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <h3 className="text-h3 font-semibold text-neutral-900 truncate">{title}</h3>
          <p className="text-body text-neutral-500 line-clamp-2">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-small text-neutral-500 border-t border-neutral-100 pt-3">
        <span className="flex items-center gap-1">
          <IconBarChart />
          {level}
        </span>
        <span className="flex items-center gap-1">
          <IconClock />
          {duration}
        </span>
        <span className="flex items-center gap-1">
          <IconGrid />
          {modules} modules
        </span>
      </div>
    </div>
  );
}

/* ── LessonVideoCard ────────────────────────────────────────── */

export interface LessonVideoCardProps {
  title: string;
  description: string;
  lesson: string;
  duration: string;
  watchFrom: string;
  onWatch?: () => void;
}

export function LessonVideoCard({
  title,
  description,
  lesson,
  duration,
  watchFrom,
  onWatch,
}: LessonVideoCardProps) {
  return (
    <div className={`${cardBase} p-4 flex flex-col gap-3`}>
      <Badge variant="video" />
      <h3 className="text-h2 font-semibold text-neutral-900">{title}</h3>
      <p className="text-body text-neutral-500 line-clamp-3">{description}</p>
      <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
        <span className="text-small text-neutral-500">
          {lesson} · {duration}
        </span>
        <button
          onClick={onWatch}
          className="inline-flex items-center gap-1.5 text-small font-medium text-primary-500 hover:underline"
        >
          <IconPlayCircle />
          Watch from {watchFrom}
        </button>
      </div>
    </div>
  );
}

/* ── LessonCard ─────────────────────────────────────────────── */

export interface LessonCardProps {
  title: string;
  description: string;
  module: string;
  lesson?: string;
  href: string;
}

export function LessonCard({
  title,
  description,
  module,
  lesson,
  href,
}: LessonCardProps) {
  return (
    <div className={`${cardBase} p-4 flex flex-col gap-3`}>
      <Badge variant="lesson" />
      <h3 className="text-h2 font-semibold text-neutral-900">{title}</h3>
      <p className="text-body text-neutral-500 line-clamp-3">{description}</p>
      <div className="flex items-center justify-between border-t border-neutral-100 pt-3">
        <span className="text-small text-neutral-500">
          {module}
          {lesson ? ` · ${lesson}` : ""}
        </span>
        <a
          href={href}
          className="inline-flex items-center gap-1.5 text-small font-medium text-neutral-700 border border-neutral-200 rounded-md px-3 py-1.5 hover:bg-neutral-50 shadow-sm"
        >
          View lesson
          <IconExternalLink />
        </a>
      </div>
    </div>
  );
}

/* ── ResourceCard ───────────────────────────────────────────── */

export interface ResourceCardProps {
  title: string;
  description: string;
  fileType: string;
  fileSize: string;
  href: string;
}

export function ResourceCard({
  title,
  description,
  fileType,
  fileSize,
  href,
}: ResourceCardProps) {
  return (
    <div className={`${cardBase} p-4 flex gap-3`}>
      <div className="flex-shrink-0 w-10 h-10 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-500">
        <IconFileText />
      </div>
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <h3 className="text-body font-semibold text-neutral-900 truncate">{title}</h3>
        <p className="text-small text-neutral-500 line-clamp-2">{description}</p>
        <p className="text-small text-neutral-400 mt-1">
          {fileType} · {fileSize}
        </p>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 text-neutral-400 hover:text-primary-500 transition-colors"
        aria-label="Open resource"
      >
        <IconExternalLink />
      </a>
    </div>
  );
}
