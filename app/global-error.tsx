"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import "./globals.css";

const isPostHogConfigured = Boolean(
  process.env.NEXT_PUBLIC_POSTHOG_KEY && process.env.NEXT_PUBLIC_POSTHOG_HOST,
);

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (isPostHogConfigured) posthog.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-full bg-white font-sans text-neutral-900">
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="font-display text-display-1">Something went wrong</h1>
          <p className="text-body-lg text-neutral-700">
            Please try again. If the problem continues, return to the home page.
          </p>
          <button
            className="rounded-md bg-primary-500 px-4 py-2 text-white"
            onClick={reset}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
