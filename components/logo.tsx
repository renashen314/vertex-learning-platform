interface VertexLogoProps {
  size?: number;
  className?: string;
}

export function VertexLogo({ size = 28, className }: VertexLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* Filled V/chevron mark in primary orange */}
      <path
        d="M2 3 L14 25 L26 3 H20 L14 17 L8 3 Z"
        fill="#F97316"
      />
    </svg>
  );
}
