import React from "react";

export type StatusVariant = "inProgress" | "completed" | "nowPlaying" | "locked";

export interface StatusIndicatorProps {
  variant: StatusVariant;
  className?: string;
}

const config: Record<
  StatusVariant,
  { label: string; colorClass: string; icon: () => React.ReactElement }
> = {
  inProgress: {
    label: "In Progress",
    colorClass: "text-neutral-500",
    icon: ClockIcon,
  },
  completed: {
    label: "Completed",
    colorClass: "text-green-600",
    icon: CheckCircleIcon,
  },
  nowPlaying: {
    label: "Now Playing",
    colorClass: "text-primary-500",
    icon: PlayCircleIcon,
  },
  locked: {
    label: "Locked",
    colorClass: "text-neutral-400",
    icon: LockIcon,
  },
};

export function StatusIndicator({ variant, className = "" }: StatusIndicatorProps) {
  const { label, colorClass, icon: Icon } = config[variant];
  return (
    <span className={`inline-flex items-center gap-1.5 text-small font-medium ${colorClass} ${className}`}>
      <Icon />
      {label}
    </span>
  );
}

/* ── Icons ──────────────────────────────────────────────────── */

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
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

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
