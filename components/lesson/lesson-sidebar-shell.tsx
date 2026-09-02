"use client";

import { useState } from "react";

import { IconChevronDown } from "@/components/ui/icons";
import { LessonSidebar, type LessonSidebarProps } from "@/components/lesson/lesson-sidebar";

/**
 * Below `lg` the sidebar collapses behind a toggle (AGENTS.md §3's own
 * mobile example), opening inline rather than as an overlay.
 */
export function LessonSidebarShell(props: LessonSidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="lg:hidden border-b border-neutral-200 bg-white">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="lesson-sidebar-mobile"
          className="w-full flex items-center justify-between px-5 py-3.5 text-body font-medium text-neutral-900"
        >
          Course Content
          <span
            className={`text-neutral-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <IconChevronDown size={18} />
          </span>
        </button>
      </div>

      <aside
        id="lesson-sidebar-mobile"
        className={`w-full lg:w-[310px] lg:flex-shrink-0 border-r border-neutral-200 bg-white lg:block ${
          open ? "block" : "hidden"
        }`}
      >
        <LessonSidebar {...props} />
      </aside>
    </>
  );
}
