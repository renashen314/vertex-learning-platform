import { Badge } from "@/components/ui/badge";

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
          <BarChartIcon />
          {level}
        </span>
        <span className="flex items-center gap-1">
          <ClockIcon />
          {duration}
        </span>
        <span className="flex items-center gap-1">
          <GridIcon />
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
          <PlayCircleIcon />
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
          <ExternalLinkIcon />
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
        <FileIcon />
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
        <ExternalLinkIcon />
      </a>
    </div>
  );
}

/* ── Shared icons ───────────────────────────────────────────── */

function BarChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function PlayCircleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
