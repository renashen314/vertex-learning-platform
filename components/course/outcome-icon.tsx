/**
 * A learning outcome stores an icon *key*, not a glyph (AGENTS.md §8) — the
 * frontend owns the artwork. Every key the schema allows has a glyph here, and
 * an unknown key degrades to the sparkles default rather than rendering a hole.
 */

export type OutcomeIconKey =
  | "cloud"
  | "code"
  | "database"
  | "gauge"
  | "layers"
  | "puzzle"
  | "rocket"
  | "shield"
  | "sparkles"
  | "terminal"
  | "workflow";

const paths: Record<OutcomeIconKey, React.ReactNode> = {
  layers: (
    <>
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </>
  ),
  gauge: (
    <>
      <path d="M3.5 19a9 9 0 1 1 17 0" />
      <line x1="12" y1="15" x2="16" y2="9" />
      <circle cx="12" cy="15" r="1.2" />
    </>
  ),
  cloud: <path d="M17.5 19a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.2 11.2 3.9 3.9 0 0 0 6.5 19z" />,
  shield: (
    <>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </>
  ),
  terminal: (
    <>
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3l1.9 4.6L18.5 9.5 13.9 11.4 12 16l-1.9-4.6L5.5 9.5l4.6-1.9z" />
      <path d="M18.5 15.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z" />
    </>
  ),
  code: (
    <>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 2c3.5 2.2 5.5 6 5.5 10l-2.4 4.4H8.9L6.5 12C6.5 8 8.5 4.2 12 2z" />
      <circle cx="12" cy="9.5" r="1.8" />
      <path d="M8.9 16.4C7 17.2 6 19 6 22c2.6 0 4.3-1 5.2-2.6" />
      <path d="M15.1 16.4c1.9.8 2.9 2.6 2.9 5.6-2.6 0-4.3-1-5.2-2.6" />
    </>
  ),
  puzzle: (
    <path d="M10 3.5a2 2 0 0 1 4 0V5h3.5a1 1 0 0 1 1 1V9.5H20a2 2 0 0 1 0 4h-1.5V18a1 1 0 0 1-1 1H13v-1.5a2 2 0 0 0-4 0V19H5.5a1 1 0 0 1-1-1v-4h1.5a2 2 0 0 0 0-4H4.5V6a1 1 0 0 1 1-1H10z" />
  ),
  workflow: (
    <>
      <rect x="3" y="3" width="7" height="6" rx="1.5" />
      <rect x="14" y="15" width="7" height="6" rx="1.5" />
      <path d="M6.5 9v6a3 3 0 0 0 3 3H14" />
    </>
  ),
};

export function OutcomeIcon({
  icon,
  size = 40,
}: {
  icon: string | null | undefined;
  size?: number;
}) {
  const key = (icon ?? "") as OutcomeIconKey;
  const glyph = paths[key] ?? paths.sparkles;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="flex-shrink-0 text-primary-500"
    >
      {glyph}
    </svg>
  );
}
