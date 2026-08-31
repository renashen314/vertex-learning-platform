"use client";

import { useState } from "react";
import Link from "next/link";
import { VertexLogo } from "@/components/logo";

export interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

export interface SiteNavProps {
  links?: NavLink[];
  showUserControls?: boolean;
}

const defaultLinks: NavLink[] = [
  { label: "Courses", href: "/courses" },
  { label: "My Learning", href: "/my-learning" },
];

export function SiteNav({
  links = defaultLinks,
  showUserControls = false,
}: SiteNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <nav className="bg-white border-b border-neutral-200 h-16 flex items-center px-4 sm:px-6 gap-3 sm:gap-8">
        {/* Logo — icon always visible; wordmark from sm */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <VertexLogo size={28} />
          <span className="hidden sm:inline text-h3 font-semibold text-neutral-900 tracking-tight">
            Vertex
          </span>
        </Link>

        {/* Hamburger toggle — only below sm, sits right of logo */}
        <button
          className="sm:hidden text-neutral-500 hover:text-neutral-900 transition-colors p-1"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-nav"
        >
          {open ? <XIcon /> : <HamburgerIcon />}
        </button>

        {/* Primary nav links — hidden below sm */}
        <ul className="hidden sm:flex items-center gap-6 list-none m-0 p-0 flex-1">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={[
                  "text-body-lg font-medium transition-colors",
                  link.active
                    ? "text-primary-500"
                    : "text-neutral-700 hover:text-neutral-900",
                ].join(" ")}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Spacer — pushes controls right on mobile */}
        <div className="flex-1 sm:hidden" aria-hidden="true" />

        {/* Right-side user controls */}
        {showUserControls && (
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              aria-label="Notifications"
              className="text-neutral-500 hover:text-neutral-900 transition-colors p-1"
            >
              <BellIcon />
            </button>
            <div
              className="w-9 h-9 rounded-full bg-neutral-200 overflow-hidden flex items-center justify-center"
              aria-label="User account"
            >
              <UserPlaceholder />
            </div>
          </div>
        )}
      </nav>

      {/* Mobile dropdown — full-width panel below nav bar */}
      {open && (
        <div
          id="mobile-nav"
          className="sm:hidden absolute left-0 right-0 top-full bg-white border-b border-neutral-200 shadow-md z-50"
        >
          <ul className="flex flex-col py-2 list-none m-0">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={[
                    "flex items-center px-5 py-3 text-body-lg font-medium transition-colors",
                    link.active
                      ? "text-primary-500"
                      : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ── Icons ──────────────────────────────────────────────────── */

function HamburgerIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function UserPlaceholder() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#94A3B8"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
