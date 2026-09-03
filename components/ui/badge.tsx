export type BadgeVariant = "video" | "lesson" | "popular";

export interface BadgeProps {
  variant: BadgeVariant;
  children?: React.ReactNode;
}

const defaultLabels: Record<BadgeVariant, string> = {
  video:   "VIDEO",
  lesson:  "LESSON",
  popular: "POPULAR",
};

/**
 * All three variants are soft pills — pale fill, saturated text — per
 * design/vertex-search.png's result-card badges and the home/course pages'
 * `popular` chip. `video` and `lesson` were sampled directly off the
 * mockup's pixels (peach/orange and lavender/indigo respectively).
 */
const variantClasses: Record<BadgeVariant, string> = {
  video:   "bg-primary-100 text-primary-500 rounded-full",
  lesson:  "bg-indigo-50 text-indigo-700 rounded-full",
  popular: "bg-primary-100 text-primary-500 rounded-sm",
};

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-2.5 py-1",
        "text-small font-medium uppercase tracking-wide",
        variantClasses[variant],
      ].join(" ")}
    >
      {children ?? defaultLabels[variant]}
    </span>
  );
}
