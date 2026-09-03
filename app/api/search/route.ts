import "server-only";

import { openai } from "@ai-sdk/openai";
import { generateText, Output, stepCountIs } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { hydrateResults } from "@/lib/search/hydrate";
import { createSearchMcpClient, fetchInitialContext } from "@/lib/search/mcp";
import { AgentOutputSchema, type SearchResponse } from "@/lib/search/schema";
import { SEARCH_SYSTEM_PROMPT } from "@/lib/search/system-prompt";

const RequestSchema = z.object({
  query: z.string().trim().min(1).max(200),
});

/**
 * The search API route (AGENTS.md §5): the only place that connects to the
 * Sanity Context MCP or holds `OPENAI_API_KEY`/`SANITY_API_READ_TOKEN`. The
 * client only ever sees the validated `SearchResponse` JSON this returns.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'A non-empty "query" string is required.' },
      { status: 400 },
    );
  }
  const { query } = parsed.data;

  let mcpClient: Awaited<ReturnType<typeof createSearchMcpClient>> | null = null;

  try {
    const [client, initialContext] = await Promise.all([
      createSearchMcpClient(),
      fetchInitialContext(),
    ]);
    mcpClient = client;

    const allTools = await mcpClient.tools();
    // Excluded per the create-agent-with-sanity-context skill: its data is
    // already in the system prompt via fetchInitialContext, so keeping the
    // tool around would only invite a redundant first-turn tool call.
    const mcpTools = Object.fromEntries(
      Object.entries(allTools).filter(([name]) => name !== "initial_context"),
    );

    const result = await generateText({
      model: openai("gpt-5-mini"),
      system: `${SEARCH_SYSTEM_PROMPT}\n\n${initialContext}`,
      prompt: `Find every lesson that matches this learner's search query: "${query}"`,
      tools: mcpTools,
      stopWhen: stepCountIs(8),
      output: Output.object({ schema: AgentOutputSchema }),
    });

    const results = await hydrateResults(result.output.results);

    const response: SearchResponse = {
      query,
      resultCount: results.length,
      courseCount: new Set(results.map((r) => r.courseSlug)).size,
      results,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Search request failed:", error);
    return NextResponse.json(
      { error: "Search is temporarily unavailable. Please try again." },
      { status: 500 },
    );
  } finally {
    await mcpClient?.close();
  }
}
