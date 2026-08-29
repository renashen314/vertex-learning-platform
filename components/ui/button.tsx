import React from "react";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "text";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed",
  secondary:
    "border border-primary-500 text-primary-500 bg-white hover:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed",
  tertiary:
    "border border-neutral-200 text-neutral-700 bg-white shadow-sm hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed",
  text: "text-primary-500 bg-transparent hover:underline disabled:opacity-50 disabled:cursor-not-allowed",
};

export function Button({
  variant = "primary",
  icon,
  iconPosition = "right",
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const sized =
    variant === "text" ? "" : "h-11 px-4 rounded-md";

  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2 font-medium text-body transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-1",
        sized,
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={disabled}
      {...props}
    >
      {icon && iconPosition === "left" && (
        <span aria-hidden="true">{icon}</span>
      )}
      {children}
      {icon && iconPosition === "right" && (
        <span aria-hidden="true">{icon}</span>
      )}
    </button>
  );
}

/* Inline SVG icons used with Button */

export function IconExternalLink() {
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
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

export function IconPlayCircle() {
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
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </svg>
  );
}
