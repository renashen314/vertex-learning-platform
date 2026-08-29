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

const variantClasses: Record<BadgeVariant, string> = {
  video:   "bg-primary-500 text-white",
  lesson:  "bg-blue-500 text-white",
  popular: "bg-green-500 text-white",
};

export function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center px-2 py-0.5 rounded-full",
        "text-small font-medium uppercase tracking-wide",
        variantClasses[variant],
      ].join(" ")}
    >
      {children ?? defaultLabels[variant]}
    </span>
  );
}
