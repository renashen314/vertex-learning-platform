import React from "react";

/* ── TextInput ──────────────────────────────────────────────── */

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showSearchIcon?: boolean;
  shortcut?: string;
}

export function TextInput({
  showSearchIcon = false,
  shortcut,
  className = "",
  ...props
}: TextInputProps) {
  return (
    <div className="relative flex items-center">
      {showSearchIcon && (
        <span className="pointer-events-none absolute left-3 text-neutral-500">
          <SearchIcon />
        </span>
      )}
      <input
        className={[
          "h-11 w-full rounded-md border border-neutral-200 bg-white px-4 text-body text-neutral-900",
          "placeholder:text-neutral-500",
          "focus:border-primary-400 focus:outline-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          showSearchIcon ? "pl-10" : "",
          shortcut ? "pr-16" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
      {shortcut && (
        <span className="pointer-events-none absolute right-3 flex items-center gap-0.5 text-small text-neutral-500">
          {shortcut}
        </span>
      )}
    </div>
  );
}

/* ── Select ─────────────────────────────────────────────────── */

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export function Select({
  options,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div className="relative flex items-center">
      <select
        className={[
          "h-11 w-full appearance-none rounded-md border border-neutral-200 bg-white px-4 pr-10",
          "text-body text-neutral-900",
          "focus:border-primary-400 focus:outline-none",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 text-neutral-500">
        <ChevronDownIcon />
      </span>
    </div>
  );
}

/* ── Icons ──────────────────────────────────────────────────── */

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
