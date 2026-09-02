import { getYouTubeEmbedUrl } from "@/lib/youtube";

/**
 * The provider's own YouTube iframe — no custom player (AGENTS.md §7/§12).
 * `startSeconds` is already validated by the page before it reaches here.
 */
export interface LessonVideoProps {
  videoUrl: string | null;
  title: string;
  startSeconds?: number;
}

export function LessonVideo({ videoUrl, title, startSeconds }: LessonVideoProps) {
  const embedUrl = getYouTubeEmbedUrl(videoUrl, startSeconds);

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-neutral-900 shadow-md">
      {embedUrl ? (
        <iframe
          src={embedUrl}
          title={title}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-body text-neutral-400">
          Video unavailable
        </div>
      )}
    </div>
  );
}
