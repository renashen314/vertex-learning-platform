import { OutcomeIcon } from "./outcome-icon";

import type { CourseLearningOutcome } from "./types";

export interface CourseOutcomesProps {
  outcomes: CourseLearningOutcome[];
}

export function CourseOutcomes({ outcomes }: CourseOutcomesProps) {
  if (outcomes.length === 0) return null;

  return (
    <section
      aria-labelledby="what-youll-learn"
      className="bg-white/60 border border-neutral-200 rounded-lg p-6 sm:p-8"
    >
      <h2
        id="what-youll-learn"
        className="text-h1 font-semibold text-neutral-900 mb-6"
      >
        What you&rsquo;ll learn
      </h2>

      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 list-none m-0 p-0">
        {outcomes.map((outcome) => (
          <li
            key={outcome._key}
            className="bg-white/70 border border-neutral-200 rounded-md p-5 sm:p-6 flex items-start gap-5"
          >
            <OutcomeIcon icon={outcome.icon} />
            <div className="flex flex-col gap-2 min-w-0">
              {outcome.title && (
                <h3 className="text-h3 font-semibold text-neutral-900">
                  {outcome.title}
                </h3>
              )}
              {outcome.description && (
                <p className="text-body text-neutral-500 leading-relaxed">
                  {outcome.description}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
