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
 * `popular` follows the design system's badge row: a pale peach chip with
 * orange text and a soft-rectangle radius, not a solid pill.
 */
const variantClasses: Record<BadgeVariant, string> = {
  video:   "bg-primary-500 text-white rounded-full",
  lesson:  "bg-blue-500 text-white rounded-full",
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
