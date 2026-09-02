"use client";

import { useId, useState } from "react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";

import { IconCheckCircle, IconLightbulb } from "@/components/ui/icons";
import { LessonResources } from "@/components/lesson/lesson-resources";

import type { LessonNotes, LessonResource } from "./types";

type Tab = "content" | "notes";

/**
 * Tailwind's preflight strips default heading and list styling, so the
 * default `@portabletext/react` serializers render invisibly plain
 * (no bold headings, no bullet markers) without this explicit map.
 */
const notesComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-body text-neutral-700 leading-relaxed">{children}</p>
    ),
    h1: ({ children }) => (
      <h3 className="text-h1 font-semibold text-neutral-900">{children}</h3>
    ),
    h2: ({ children }) => (
      <h3 className="text-h2 font-semibold text-neutral-900">{children}</h3>
    ),
    h3: ({ children }) => (
      <h3 className="text-h3 font-semibold text-neutral-900">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-h3 font-semibold text-neutral-900">{children}</h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-primary-300 pl-4 text-body text-neutral-500 italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc pl-5 flex flex-col gap-1">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal pl-5 flex flex-col gap-1">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="text-body text-neutral-700">{children}</li>,
    number: ({ children }) => <li className="text-body text-neutral-700">{children}</li>,
  },
};

export interface LessonTabsProps {
  notes: LessonNotes | null;
  keyPoints: string[] | null;
  proTip: string | null;
  resources: LessonResource[] | null;
}

/**
 * The Notes tab is presentational only — no backend exists for it
 * (AGENTS.md §7). Both panels stay mounted and are toggled with `hidden` so
 * typed notes survive switching tabs within the session, but nothing
 * persists across a reload.
 */
export function LessonTabs({ notes, keyPoints, proTip, resources }: LessonTabsProps) {
  const [tab, setTab] = useState<Tab>("content");
  const idPrefix = useId();
  const contentPanelId = `${idPrefix}-content-panel`;
  const notesPanelId = `${idPrefix}-notes-panel`;

  return (
    <section className="flex flex-col gap-6">
      <div role="tablist" aria-label="Lesson tabs" className="flex gap-6 border-b border-neutral-200">
        <TabButton
          id={`${idPrefix}-content-tab`}
          controls={contentPanelId}
          active={tab === "content"}
          onClick={() => setTab("content")}
        >
          Lesson Content
        </TabButton>
        <TabButton
          id={`${idPrefix}-notes-tab`}
          controls={notesPanelId}
          active={tab === "notes"}
          onClick={() => setTab("notes")}
        >
          Notes
        </TabButton>
      </div>

      <div
        id={contentPanelId}
        role="tabpanel"
        aria-labelledby={`${idPrefix}-content-tab`}
        hidden={tab !== "content"}
        className="flex flex-col gap-8"
      >
        {notes && notes.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-h2 font-semibold text-neutral-900">Overview</h2>
            <div className="flex flex-col gap-4">
              <PortableText value={notes} components={notesComponents} />
            </div>
          </div>
        )}

        {keyPoints && keyPoints.length > 0 && (
          <div className="flex flex-col gap-3">
            <h2 className="text-h2 font-semibold text-neutral-900">
              In this lesson you will:
            </h2>
            <ul className="flex flex-col gap-2.5 list-none m-0 p-0">
              {keyPoints.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-body text-neutral-700">
                  <span className="flex-shrink-0 text-primary-500 mt-0.5" aria-hidden="true">
                    <IconCheckCircle size={18} />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {proTip && (
          <div className="flex gap-3 bg-primary-100 border border-primary-200 rounded-lg p-5">
            <span className="flex-shrink-0 text-primary-500" aria-hidden="true">
              <IconLightbulb size={20} />
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-body font-semibold text-neutral-900">Pro Tip</span>
              <span className="text-body text-neutral-700 leading-relaxed">{proTip}</span>
            </div>
          </div>
        )}

        {resources && resources.length > 0 && <LessonResources resources={resources} />}
      </div>

      <div
        id={notesPanelId}
        role="tabpanel"
        aria-labelledby={`${idPrefix}-notes-tab`}
        hidden={tab !== "notes"}
      >
        <textarea
          placeholder="Type your notes for this lesson here..."
          rows={10}
          className="w-full rounded-lg border border-neutral-200 p-4 text-body text-neutral-900 leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 resize-y"
        />
      </div>
    </section>
  );
}

function TabButton({
  id,
  controls,
  active,
  onClick,
  children,
}: {
  id: string;
  controls: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      id={id}
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={controls}
      onClick={onClick}
      className={[
        "pb-3 text-body-lg font-medium border-b-2 -mb-px transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1",
        active
          ? "border-primary-500 text-primary-500"
          : "border-transparent text-neutral-500 hover:text-neutral-900",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
