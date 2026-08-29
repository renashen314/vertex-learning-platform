"use client";

export interface PaginationProps {
  current: number;
  total: number;
  onPageChange?: (page: number) => void;
}

export function Pagination({ current, total, onPageChange }: PaginationProps) {
  const pages = buildPageList(current, total);

  return (
    <nav aria-label="Pagination" className="flex items-center gap-1">
      <PageButton
        onClick={() => onPageChange?.(current - 1)}
        disabled={current <= 1}
        aria-label="Previous page"
      >
        <ChevronLeftIcon />
      </PageButton>

      {pages.map((page, i) =>
        page === "ellipsis" ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-9 w-9 items-center justify-center text-body text-neutral-500"
          >
            …
          </span>
        ) : (
          <PageButton
            key={page}
            active={page === current}
            onClick={() => onPageChange?.(page as number)}
            aria-label={`Page ${page}`}
            aria-current={page === current ? "page" : undefined}
          >
            {page}
          </PageButton>
        )
      )}

      <PageButton
        onClick={() => onPageChange?.(current + 1)}
        disabled={current >= total}
        aria-label="Next page"
      >
        <ChevronRightIcon />
      </PageButton>
    </nav>
  );
}

/* ── Helpers ────────────────────────────────────────────────── */

function buildPageList(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) pages.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let p = start; p <= end; p++) pages.push(p);

  if (current < total - 2) pages.push("ellipsis");
  pages.push(total);

  return pages;
}

/* ── PageButton ─────────────────────────────────────────────── */

interface PageButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

function PageButton({ active = false, children, className = "", ...props }: PageButtonProps) {
  return (
    <button
      className={[
        "flex h-9 w-9 items-center justify-center rounded-md text-body font-medium transition-colors",
        active
          ? "bg-primary-500 text-white"
          : "text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}

/* ── Icons ──────────────────────────────────────────────────── */

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
