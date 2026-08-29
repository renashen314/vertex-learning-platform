export interface ProgressBarProps {
  value: number; /* 0–100 */
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  showLabel = true,
  className = "",
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 h-2 rounded-full bg-neutral-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary-500 transition-all duration-300"
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      {showLabel && (
        <span className="text-small text-neutral-500 whitespace-nowrap">
          {clamped}% complete
        </span>
      )}
    </div>
  );
}
