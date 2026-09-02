/**
 * Presentation-side formatting for values stored as raw data.
 *
 * Durations are stored in seconds and student counts as integers (AGENTS.md §8);
 * "18h 24m" and "2.1k students" are display, so they are derived here rather
 * than stored. Pure and dependency-free, safe on either side of the boundary.
 */

/**
 * Formats a stored duration in seconds as "1h 28m", "2h", or "45m".
 *
 * Total minutes are rounded before the split, not after: rounding the leftover
 * seconds on their own lets 7180s round up to "1h 60m" instead of carrying into
 * the hour.
 */
export function formatDuration(totalSeconds: number | null | undefined): string {
  if (typeof totalSeconds !== "number" || totalSeconds <= 0) return "0m";
  const totalMinutes = Math.round(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

/**
 * Compact student count: 18240 -> "18.2k", 2100 -> "2.1k", 940 -> "940".
 * Returns null when there is no count, so the caller can drop the whole item
 * rather than render a zero the data never claimed.
 */
export function formatStudentCount(count: number | null | undefined): string | null {
  if (typeof count !== "number" || count < 0) return null;
  if (count < 1000) return String(count);
  const thousands = count / 1000;
  /* 18.2k, but 18k rather than 18.0k */
  const rounded = Math.round(thousands * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}k`;
}

/** "intermediate" -> "Intermediate". */
export function formatLevel(level: string | null | undefined): string | null {
  if (!level) return null;
  return level.charAt(0).toUpperCase() + level.slice(1);
}
