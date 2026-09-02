import { IconExternalLink, IconFileText, IconGithub } from "@/components/ui/icons";

import type { LessonResource } from "./types";

const typeIcon: Record<NonNullable<LessonResource["type"]>, React.ReactNode> = {
  documentation: <IconFileText size={18} />,
  guide: <IconFileText size={18} />,
  repository: <IconGithub size={18} />,
};

export interface LessonResourcesProps {
  resources: LessonResource[];
}

export function LessonResources({ resources }: LessonResourcesProps) {
  if (resources.length === 0) return null;

  return (
    <section aria-labelledby="lesson-resources" className="flex flex-col gap-4">
      <h2 id="lesson-resources" className="text-h2 font-semibold text-neutral-900">
        Resources
      </h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 list-none m-0 p-0">
        {resources.map((resource) => (
          <li key={resource._key}>
            <a
              href={resource.url ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-3 h-full bg-white rounded-lg border border-neutral-200 shadow-sm p-4 hover:bg-neutral-50 transition-colors"
            >
              <span className="flex-shrink-0 w-9 h-9 rounded-md bg-primary-100 text-primary-500 flex items-center justify-center">
                {resource.type ? typeIcon[resource.type] : <IconFileText size={18} />}
              </span>
              <span className="flex flex-col gap-1 min-w-0 flex-1">
                <span className="text-body font-semibold text-neutral-900">
                  {resource.title}
                </span>
                {resource.description && (
                  <span className="text-small text-neutral-500 line-clamp-2">
                    {resource.description}
                  </span>
                )}
              </span>
              <span className="flex-shrink-0 text-neutral-400" aria-hidden="true">
                <IconExternalLink size={16} />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
