import "server-only";

import { createMCPClient } from "@ai-sdk/mcp";

import { dataset, getReadToken, projectId } from "@/sanity/env";

const MCP_API_VERSION = "v2026-03-03";

function requireContextSlug(): string {
  const slug = process.env.SANITY_CONTEXT_SLUG;
  if (!slug) {
    throw new Error("Missing environment variable: SANITY_CONTEXT_SLUG");
  }
  return slug;
}

/** The Sanity Context document's MCP URL — see studio/scripts/seed/context.ndjson. */
export function getMcpUrl(): string {
  return `https://api.sanity.io/${MCP_API_VERSION}/context/mcp/${projectId}/${dataset}/${requireContextSlug()}`;
}

function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getReadToken()}` };
}

let cachedInitialContext: Promise<string> | null = null;

/**
 * Fetches the MCP's schema/instructions blob once per server process and
 * caches it for every subsequent search request.
 *
 * AGENTS.md §12: editing the Context document's Instructions takes effect on
 * the MCP's next request, but this cached prefix — and any inline system
 * prompt change — only refreshes when the Next.js server restarts.
 */
export function fetchInitialContext(): Promise<string> {
  if (!cachedInitialContext) {
    cachedInitialContext = fetch(`${getMcpUrl()}/initial-context`, {
      headers: authHeaders(),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Sanity Context initial-context request failed: ${res.status}`);
        }
        return res.text();
      })
      .catch((error: unknown) => {
        // Don't poison the cache with a failed attempt — the next request retries.
        cachedInitialContext = null;
        throw error;
      });
  }
  return cachedInitialContext;
}

export function createSearchMcpClient() {
  return createMCPClient({
    transport: {
      type: "http",
      url: getMcpUrl(),
      headers: authHeaders(),
    },
  });
}
