/**
 * Turns a stored YouTube URL into a safe embed `src`.
 *
 * The id is regex-extracted from the stored string, never interpolated
 * directly — the embed `src` is always built from `youtube.com/embed/<id>`
 * plus known query params, so a malformed or unexpected stored value can
 * only ever fail to parse, never inject an arbitrary host.
 */

const YOUTUBE_ID_PATTERNS = [
  /(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{6,})/,
];

export function getYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null;
  for (const pattern of YOUTUBE_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

/**
 * Builds the embed URL. `startSeconds` is expected to already be validated
 * (non-negative integer) by the caller — this function just omits the param
 * when absent.
 */
export function getYouTubeEmbedUrl(
  url: string | null | undefined,
  startSeconds?: number,
): string | null {
  const id = getYouTubeVideoId(url);
  if (!id) return null;

  const params = new URLSearchParams({ rel: "0", modestbranding: "1" });
  if (typeof startSeconds === "number" && startSeconds > 0) {
    params.set("start", String(Math.floor(startSeconds)));
  }

  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

/** Parses and validates the `t` search param: a non-negative integer, or null. */
export function parseStartSeconds(value: string | string[] | undefined): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0) return null;
  return parsed;
}
