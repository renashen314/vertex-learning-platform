# 09 — Intelligent search: Sanity Context MCP, search API, results page

## Goal

Build the full search experience described in AGENTS.md §7/§11: a learner types
a plain-language query and lands on a full results page (`design/vertex-search.png`)
showing ranked video and lesson result cards, computed by an LLM that queries the
live Sanity dataset through the Sanity Context MCP — never a hand-written GROQ
endpoint, never invented data.

**Confirmed scope for this round (asked the user directly):** no `video` Sanity
document type exists yet, and transcript/chapter ingestion (§9) is a separate,
not-yet-built deliverable — even though all 120 seeded lessons already have real
YouTube URLs. Building per-second video-moment matching now would mean either
fabricating a matched second (violates the grounding rule in §7/§11) or scope-
creeping into ingestion work that wasn't asked for. **The user chose: build the
full two-result-type architecture (API contract, Zod schema, UI, both card
components) now, but only wire the lesson-topic matching path with real data.**
No `video` schema this round. Search returns lesson-type results only until a
future ingestion phase adds video documents — at which point video results light
up with no further code changes, because the schema, system prompt, and UI
already carry the video-result shape end to end.

---

## Skills and docs read

| Source | What I took from it |
|---|---|
| `create-agent-with-sanity-context/SKILL.md` | The MCP integration pattern: initial-context fetch + inject into system prompt, `createMCPClient` over HTTP with bearer auth, exclude `initial_context` from the tool set passed to the model, `groqFilter` scopes visible types |
| `create-agent-with-sanity-context/references/nextjs-agent.md` | Next.js + AI SDK reference route shape (`buildSystemPrompt`, MCP client creation, tool combination) — adapted, not copied: the reference is a chat endpoint: I'm building a single-shot structured-JSON endpoint, not a chat loop |
| `create-agent-with-sanity-context/references/system-prompts.md` | System prompt structure (`## Your Capabilities` / `## How to Respond`) |
| `create-agent-with-sanity-context/references/studio-setup.md` | Sanity Context document fields (`name`, `slug`, `groqFilter`, `instructions`); the plugin/no-plugin fallback (edit the doc by import) |
| `dial-your-context/SKILL.md` | "Pure deltas only" — Instructions should hold only what the schema doesn't make obvious. I did not run the full interactive session (no live user dataset walkthrough); I wrote the Instructions directly from schema inspection below, since every claim in them is verifiable against the schema files I already read, not a small unverified sample. Flagged as a decision below — a follow-up `dial-your-context` session against the live MCP is still worth doing once real queries are observed. |
| `shape-your-agent/SKILL.md` | "Less is more" — kept the system prompt to role, capability, and a hard "never invent" boundary; all data/query rules live in Instructions and the query-pattern section, not duplicated as prose |
| AGENTS.md §5, §12 | Browser never holds a token or calls the MCP/LLM; the search API is a server route; `SANITY_API_READ_TOKEN` stays server-only; never return whole transcripts/chunks (moot this round — no video docs); the search route caches initial context, so instruction/prompt edits need a server restart |
| AGENTS.md §7, §11 | Search is MCP + LLM surfaced as result cards, not a chatbox; full results page with count + sort, default most relevant; two result kinds; ground every result in real data; token-based wildcard match, OR multiple words, never whole-phrase; Portable Text needs a plain-text projection; put critical rules in both the system prompt and the Context document |
| `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/03-route.md` | Route Handler conventions for `app/api/search/route.ts` (POST, `NextRequest`/`Response.json`) |

---

## Code and data inspected

| File / source | Relevant state |
|---|---|
| `studio/schemaTypes/documents/{course,lesson}.ts` | Confirmed field shapes. `lesson` has no course reference (reverse-reference only); `notes` is Portable Text; `keyPoints` is a plain string array; no `video` type or `videoUrl`-keyed lookup document exists anywhere in the schema |
| `studio/schemaTypes/objects/module.ts` | Module numbering ("Module 5 of 12", "Lesson 5.1") is derived from array order and never stored — the single biggest thing the agent's Instructions must say explicitly, since no query against the schema alone would reveal it |
| `studio/package.json`, `npm view @sanity/context peerDependencies` | `@sanity/context@1.0.0` requires `sanity: '^6'`; this Studio runs `sanity@^5.31.2`. **Major version mismatch — do not install the plugin**, per AGENTS.md §12's own named failure mode. The Context document is created by import instead, and Conversation Insights stays unavailable. |
| `studio/structure.ts` | `structureTool({structure})` uses an explicit structure. Moot here since the plugin isn't installed — `sanity.agentContext` is never a registered schema type, so it can't appear in the structure regardless. Not touched. |
| `studio/scripts/seed/seed.ndjson` | Confirms the project's import convention: hand-authored `.ndjson`, imported with `npx sanity dataset import <file> production` run from `studio/`, using the CLI's own authenticated session — not the read-only `SANITY_API_READ_TOKEN`. The new Context document follows the same path. |
| `studio/scripts/seed/seed.ndjson` (videoUrl grep) | All 120 lessons carry real `youtube.com/watch?v=...` URLs — confirms videos are real content, just not yet ingested into a `video` document. Not used this round per the confirmed scope. |
| `sanity/lib/client.ts`, `sanity/lib/fetch.ts`, `sanity/env.ts` | The existing read path (`sanityFetch`/`client`) is for page rendering only — deliberately not reused for search, since AGENTS.md §7 requires the LLM to write the GROQ over the MCP, not the app |
| `sanity/lib/lesson-position.ts` | `deriveLessonPosition` computes "Module 5 of 12"/"Lesson 5.1" for the *lesson page*, which already has the full course+modules object in hand. The search agent doesn't have that luxury — it must derive the same numbers itself from a `modules[]{title,"lessonIds":lessons[]._ref}` projection, since it can't import a TS helper. This exact derivation is written into the agent's Instructions (see below), mirroring the helper's own logic. |
| `sanity/queries/lessons.ts`, `sanity/queries/courses.ts` | `LESSON_BY_SLUG_QUERY`'s reverse-reference pattern (`*[_type=="course" && references(^._id)][0]`) is the pattern the agent's Instructions teach for finding a lesson's course |
| `components/ui/card.tsx` | `LessonVideoCard` and `LessonCard` already exist as unstyled design-system primitives (from the 01 design-system prompt) with almost exactly the right props (`title`, `description`, `lesson`/`module`, `duration`, `watchFrom`/`href`) — but they render as bare cards with no thumbnail image, no course branding row, and are currently unused anywhere in the app. Not reused directly (see Decision 6); new `components/search/*` cards are built using the same `Badge`, icon, and card-shell conventions instead. |
| `components/ui/badge.tsx` | `video`/`lesson` badge variants already exist and render exactly the pill shown in the mockup's top-right corner — reused as-is |
| `components/ui/input.tsx` | `TextInput` (search icon + `⌘K` shortcut slot) and `Select` (chevron dropdown) match the mockup's search box and sort control exactly — reused as-is |
| `components/course/course-card.tsx` | `CourseTile`'s pattern (cover image if present, else a solid dark tile with the title's first letter) is the only existing "course branding" visual in the app — no per-category or per-framework icon data exists anywhere in the schema. Reused for the result cards' course row rather than inventing framework logos the mockup's icons suggest but the schema has no field for. |
| `lib/youtube.ts` | `parseStartSeconds` already validates the `t` query param the lesson page reads; the video result card links to `/lessons/[slug]?t=<seconds>` using the same contract, already built and tested by the 08 lesson-page prompt for exactly this purpose |
| `lib/format.ts` | `formatDuration` reused for card duration labels |
| `components/nav/site-nav.tsx` | No search entry point (icon/box) exists in the nav, and `design/vertex-search.png` doesn't show one either — the mockup's only search box is on the results page itself. Not adding one to `SiteNav`, since AGENTS.md §3 says build only to the reference image. `/search?q=...` is reached by direct navigation for now; a nav entry point is a follow-up if the user wants one. |
| `package.json` | None of `ai`, `@ai-sdk/openai`, `@ai-sdk/mcp`, `zod`, `react-markdown` are installed yet, despite being named in AGENTS.md §6. `npm view` confirms current versions: `ai@7.0.90`, `@ai-sdk/openai@4.0.56`, `@ai-sdk/mcp@2.0.43` (its `latest` dist-tag, matched to `ai@7`), `zod@4.5.4`, `react-markdown@10.1.0`. `@ai-sdk/mcp`'s package exports confirm a plain `createMCPClient`-shaped default entry plus a separate `./mcp-stdio` subpath — the main entry is the one to use (HTTP transport). |
| `.env.local`, `.env.example` | No `OPENAI_API_KEY` or any LLM key present yet. `SANITY_API_READ_TOKEN` (viewer role) exists and is reused as the MCP bearer token — no new Sanity token needed. |
| `app/` | No `app/api/*` route exists yet — this is the first Next.js Route Handler in the project. |

---

## Decisions and assumptions

1. **OpenAI provider, not Anthropic**, per AGENTS.md §6's explicit tech-stack line ("the Vercel AI SDK with the OpenAI provider"), even though the reference skill examples use Anthropic. `@ai-sdk/openai`, model `gpt-5-mini` class model for cost — exact model id chosen at implementation time from what's actually available on the user's OpenAI account, defaulting to a mid-tier model since this is tool-calling + structured output, not creative writing.

2. **No Studio plugin.** `@sanity/context` needs Sanity v6; this Studio is v5.31.2. Per AGENTS.md §12's named fallback: create the Context document by import, and Conversation Insights (conversation tracking dashboard) is unavailable until the plugin catches up. This is a real limitation, not a workaround — flagged to the user in the report.

3. **One Sanity Context document, authored directly rather than through a full interactive `dial-your-context` session.** Every schema-derived claim in its Instructions (below) is backed by the schema files already read in this pass, not a small unverified query sample — the one thing `dial-your-context` is most protective about. What a live session would add on top (testing against the actual MCP with real queries, catching things the schema-read pass can't) is called out as a good follow-up once the endpoint is live and real queries can be observed. Document: `_type: "sanity.agentContext"`, slug `vertex-search`, imported the same way `seed.ndjson` was (`npx sanity dataset import` from `studio/`, the CLI's own session — I don't have a Sanity write token or authenticated Sanity MCP in this environment).

   **Content filter:** `_type in ["course", "lesson"] && !(_id in path("drafts.**"))`.

   **Instructions** (pure deltas — nothing the auto-generated schema already states):
   ```
   ### Schema notes
   - `lesson` does not store its parent course. Find it with a reverse
     reference: `*[_type == "course" && references($lessonId)][0]`.
   - `notes` on `lesson` is Portable Text, not a string — text-match it with
     `pt::text(notes) match "*term*"`, never match the raw field.
   - "Module 5 of 12" and "Lesson 5.1" are never stored. They are 1-based
     positions in `course.modules[]` and each module's `lessons[]`. To find a
     lesson's position: fetch its course as
     `modules[]{title, "lessonIds": lessons[]._ref}`, find which module's
     `lessonIds` contains the lesson id (that index + 1 = module number), then
     find the lesson's index inside that module's `lessonIds` (+1 = lesson
     number). Do this arithmetic yourself — there is no field to query for it.
   - There is no `video` document type in this dataset yet. Never invent a
     matched timestamp or a "video" result — only produce lesson-topic results
     until video documents exist.

   ### Query patterns
   - Lesson topic match: `*[_type == "lesson" && (title match "*term1*" ||
     title match "*term2*" || pt::text(notes) match "*term1*" ||
     pt::text(notes) match "*term2*" || keyPoints[] match "*term1*")]`.
     Wildcard and OR every significant word from the query — never match the
     whole phrase as one pattern.
   - Always exclude drafts: `!(_id in path("drafts.**"))` (redundant with the
     content filter, but repeat it in queries you write directly).

   ### Ranking
   - Rank by specificity: a title match beats a notes match; an exact-word
     match beats a partial wildcard match; a match on more of the query's
     words beats a match on fewer.
   ```

4. **Single-shot structured JSON, not a streaming chat response.** The results
   page renders a normal list of cards once, not token-by-token prose — so
   `generateText` with `experimental_output: Output.object({schema})` (the AI
   SDK's structured-output-alongside-tool-calls mode) is used instead of
   `streamText`. This also keeps the endpoint's response directly Zod-validated
   end to end, matching AGENTS.md §6's "Zod for validating structured output".
   `stopWhen: stepCountIs(8)` caps tool-call rounds so a confused model can't
   loop indefinitely.

5. **The LLM never emits a URL.** Its structured output carries `lessonSlug`
   and (for a future video result) `startSeconds` as plain fields; the React
   layer builds `/lessons/${slug}` and `/lessons/${slug}?t=${startSeconds}`
   itself, reusing `parseStartSeconds`'s contract. This keeps a malformed or
   hallucinated path out of an `href` — the model supplies data, the app
   supplies routing.

6. **New `components/search/*` cards, not a reuse of `components/ui/card.tsx`'s
   `LessonVideoCard`/`LessonCard`.** Those are unstyled design-system
   showcases with no thumbnail, no course-branding row, and no real prop
   shape (`onWatch: () => void` instead of a route). Rebuilding on top of the
   same `Badge`, icon, and `formatDuration` conventions is more direct than
   retrofitting props onto a component nothing else uses yet.

7. **Course branding on a card is `CourseTile`'s existing pattern** (cover
   image, else a dark tile with the title's first letter) — not the
   framework-logo icons the mockup's pixels suggest, since no icon field
   exists on `course` or `category` and inventing one is schema/content work
   outside a search-implementation task.

8. **Sort control:** "Most Relevant" (default — the order the LLM/GROQ ranking
   returns) and "Title (A–Z)" (client-side re-sort of the already-fetched
   list, no re-fetch). The mockup shows a closed dropdown with only "Most
   Relevant" visible; a second, generic, always-available field (title) is
   the smallest defensible addition rather than guessing at unseen options.

9. **`/search?q=<query>` is a server component shell + client fetcher.** The
   page reads `q` from `searchParams` (Next 16 async pattern, per `08`) and
   server-renders the "Results for “query”" heading immediately (no
   flash-of-empty-title), then a client `<SearchResults initialQuery={q} />`
   owns the actual fetch to `POST /api/search`, loading/empty/error states,
   the sort re-order, and the `search_performed` PostHog capture — matching
   AGENTS.md §5's page/API boundary (pages read-only, API does the MCP work,
   client component renders the response).

10. **Initial context is fetched once per server process and cached in a
    module-level variable** (`app/api/search/route.ts`'s backing lib), per
    AGENTS.md §12: prompt/instruction edits after that need a server restart.
    This is stated in the manual test steps below so it isn't mistaken for a
    bug during review.

11. **Empty/zero-result states never fabricate results.** No `q` param →
    a prompt state, no fetch. Zero matches → the mockup's "Can't find what
    you're looking for?" band, sized as the whole page's content (not just a
    footer strip) since there's nothing else to show. Non-zero results →
    the same band renders as a persistent footer under the last card,
    matching the mockup exactly.

---

## Files to create / modify

### New dependencies (`package.json`)
- `ai@7.0.90`, `@ai-sdk/openai@4.0.56`, `@ai-sdk/mcp@2.0.43`, `zod@4.5.4`, `react-markdown@10.1.0` (installed even though this round's output is pure JSON, not markdown — kept per AGENTS.md §6 for the day a free-text agent reply is added; not wired into any component yet since nothing renders one)

### Env
- `.env.example` / `.env.local` — add `OPENAI_API_KEY` (server only) and `SANITY_CONTEXT_SLUG=vertex-search` (server only; combined with the existing `projectId`/`dataset`/`SANITY_API_READ_TOKEN` to build the MCP URL — no new Sanity token)

### Studio (content, no schema change)
- `studio/scripts/seed/context.ndjson` — the one `sanity.agentContext` document (Decision 3)

### Server (`lib/search/`, new)
- `lib/search/schema.ts` — Zod: `SearchResultLesson`, `SearchResultVideo`, discriminated-union `SearchResult`, `SearchResponse { resultCount, courseCount, results }`
- `lib/search/mcp.ts` (`server-only`) — builds the MCP URL from `projectId`/`dataset`/`SANITY_CONTEXT_SLUG`, fetches and caches `/initial-context`, creates the MCP client with the bearer token
- `lib/search/system-prompt.ts` — the inline `SYSTEM_PROMPT` (role, capability, "never invent a course/lesson/timestamp", defers ranking/query mechanics to Instructions + MCP per `shape-your-agent`'s separation principle)

### API
- `app/api/search/route.ts` — `POST`, validates `{ query: string }`, runs the MCP-tooled `generateText` call, returns the Zod-validated `SearchResponse` as JSON; 400 on empty/invalid query, 500 with a safe generic message on MCP/LLM failure (never leaks the token or raw provider error text)

### UI
- `components/search/search-bar.tsx` — wraps `TextInput`, submits by pushing `?q=` via `useRouter`
- `components/search/video-result-card.tsx`, `components/search/lesson-result-card.tsx` — the two card kinds, built on `Badge`, icon set, `formatDuration`, `CourseTile`-style branding
- `components/search/search-results.tsx` (client) — fetch orchestration, loading skeleton, sort control (`Select`), empty/error states, PostHog `search_performed` capture
- `app/search/page.tsx` — server shell, `generateMetadata`, renders `SiteNav` + heading + `SearchResults`

---

## Requirements

- Every result must trace to a real `lesson`/`course` document the MCP actually returned — no client-side or server-side fabrication of a title, course, timestamp, or count.
- The API route never exposes `SANITY_API_READ_TOKEN` or `OPENAI_API_KEY` to the client; both are read only inside the server route / its server-only lib modules.
- The results page always shows a real result count and, when present, a distinct course count (`courseCount`), matching the mockup's "Found 28 results across 8 courses".
- A lesson result's action opens `/lessons/[slug]`; a (future) video result's action opens `/lessons/[slug]?t=<startSeconds>` — both built by the app, never returned as a URL by the model.
- Search is resilient to an LLM/MCP failure: the UI shows a retry-capable error state, never a blank page or an unhandled exception.
- Mobile: the search box, sort control, and cards stack to full width below `sm`, following the responsive patterns already used on `/courses`.

## Security considerations

- `query` is validated (non-empty string, reasonable max length) before being interpolated into the model's user message — bounds the prompt-injection surface a learner could attempt via the search box, though the model has no write tools and the MCP's `groqFilter` already caps what it can read.
- The route never passes MCP tool output straight through to the client — only the Zod-validated structured object the model produces, so nothing outside the declared schema shape (e.g. an accidental full lesson `notes` blob) can leak into the response.
- No secrets in client bundles: `OPENAI_API_KEY`, `SANITY_API_READ_TOKEN`, and the MCP URL are only ever referenced from `server-only`-guarded modules.

## Acceptance criteria

- [ ] `/search?q=data+fetching` (or similar) renders result cards sourced from real seeded lessons, matching the mockup's layout, badges, and meta lines
- [ ] Result count and course count are real, derived from what the model actually returned
- [ ] Sort control toggles between "Most Relevant" (server order) and "Title (A–Z)" without a re-fetch
- [ ] Clicking a lesson card's "View lesson" navigates to the real `/lessons/[slug]`
- [ ] No `q` param → prompt state; zero matches → empty state with a link back to `/courses`; MCP/LLM failure → visible error state with retry
- [ ] No video-type results are fabricated — confirmed by inspecting a raw API response and the Instructions document's explicit rule
- [ ] `search_performed` PostHog event fires once per completed search with `query` and `result_count`
- [ ] Mobile layout (search box, sort, cards) stacks correctly below `sm`

## Checks to run

- `npm run typecheck`
- `npm run lint`
- `npm run build` (new route + server code)
- `npm run dev` — manual test below
- Studio: confirm the Studio is already deployed (`npx sanity deploy` from `studio/` if not — required before the MCP will serve the dataset at all, per AGENTS.md §12); import `context.ndjson`; verify with a direct `curl` against the MCP endpoint

## Manual test steps

1. `cd studio && npx sanity dataset import scripts/seed/context.ndjson production` (creates the Context document; safe to re-run, it's idempotent on `_id`)
2. Confirm the MCP endpoint serves the new Instructions:
   ```
   curl -H "Authorization: Bearer $SANITY_API_READ_TOKEN" \
     "https://api.sanity.io/v2026-03-03/context/mcp/<projectId>/production/vertex-search/initial-context"
   ```
   and check the response includes the `## Custom instructions` block from Decision 3.
3. `npm run dev`, visit `http://localhost:3000/search?q=data%20fetching` — expect real lesson cards, a true result/course count, "Most Relevant" selected by default.
4. Switch the sort control to "Title (A–Z)" — list re-orders instantly, no network tab activity.
5. Click a card's "View lesson" — lands on the real `/lessons/[slug]` page.
6. Visit `/search?q=zzzznonexistenttopiczzzz` — expect the empty state with a working "Browse all courses" link.
7. Visit `/search` with no `q` — expect the prompt state, no request fired.
8. Temporarily break `OPENAI_API_KEY` (or stop network) and search — expect the visible error state, not a crash.
9. Resize to a mobile width — search box, sort dropdown, and cards stack full-width.
10. In PostHog (or the network tab's `/e/` capture calls), confirm one `search_performed` event per completed search.
11. Restart the dev server after any edit to `context.ndjson` or `system-prompt.ts` — confirms Decision 10's caching note is real and not a bug.
