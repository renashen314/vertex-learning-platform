# Vertex

Vertex is a learning platform where learners find exactly what they need through AI-powered search — a plain-language query returns ranked, clickable result cards that jump straight to the right lesson, and the exact second in a lesson's video where a topic is taught.

## The problem it solves

Course video is hard to search. A learner who wants "how does caching work in the app router" has to guess which course, open it, scan module titles, open a lesson, and scrub the video by hand.

Vertex replaces that hunt with a search results page: type the question, get back real lessons and video moments ranked by relevance, and click straight into the content.

## How it works

Search is powered by the **Sanity Context MCP** plus an LLM (OpenAI, via the Vercel AI SDK), not a hand-rolled ranking algorithm. The model is given the live Sanity schema and a scoped system prompt, writes GROQ against the actual content, and returns a short list of matches (lesson slug + why it matched).

The API route re-fetches every field a result card needs straight from Sanity: title, course, thumbnail, module/lesson numbering, so nothing the UI shows is invented by the model.

Results render as a full page with a result count and two card types: **lesson results** (matched on topic) and **video moment results** (matched at a specific timestamp, once video ingestion is wired up — see [Current status](#current-status)).

## Key features

- **Course catalog & detail pages** — browse courses by category, see modules and lessons, instructor info, and what-you'll-learn outcomes, all served from Sanity.
- **Lesson pages** — embedded video playback, lesson notes (Portable Text), key points, pro tips, downloadable resources, and prev/next navigation.
- **AI-powered search** — natural-language query → ranked, grounded result cards (lessons today, video moments once ingestion ships), with an empty state that points back to the catalog.
- **Authentication** — sign-up/sign-in and route protection via Clerk, with public browsing and auth gated only where a feature needs it.
- **Product analytics** — PostHog instrumentation across the funnel: course/lesson views, module and content expansion, bookmarking, search performed, search result selected, and course started.
- **Structured content model** — courses, modules, lessons, instructors, and categories authored in a standalone Sanity Studio, typed end-to-end with Sanity TypeGen.

## Current status

Built and working: design system, home page, course catalog & detail, lesson pages with video playback, Clerk auth, PostHog analytics, and AI search over lesson content (topic-level matching).

Designed but not yet wired up: the `video` document type and offline transcript/chapter ingestion pipeline that would enable timestamp-level video-moment search (the search schema is already shaped to support it — see `lib/search/schema.ts`), the My Learning page, instructor pages, and learner progress tracking (completion + resume position).

## Architecture

Two independently deployable workspaces in one repo:

- **`studio/`** — Sanity Studio. Content authoring and schema only.
- **web (repo root: `app/`, `components/`, `lib/`, `sanity/`)** — the Next.js app. Pages are read-only renderers of Sanity content; auth, data access, and the search API are strictly server-side; the browser never holds a Sanity token, calls the MCP, or writes content directly.

Any write (e.g. saving learner progress) goes through a server route with its own write token — the browser never writes content or app state directly.

## Tech stack & third-party integrations

| Purpose            | Tool                                                                          |
| ------------------ | ----------------------------------------------------------------------------- |
| Framework          | Next.js (App Router), TypeScript                                              |
| Content / CMS      | Sanity Studio, `next-sanity`, `@sanity/image-url`, `@portabletext/react`      |
| Search             | Sanity Context MCP, Vercel AI SDK, OpenAI, Zod (structured output validation) |
| Auth               | Clerk                                                                         |
| Analytics          | PostHog                                                                       |
| Styling            | Tailwind CSS                                                                  |
| Markdown rendering | `react-markdown` (search reply text only)                                     |

## Project structure

```
app/            Next.js routes — catalog, course, lesson, search, sign-in/up, search API
components/     UI split by domain (course, lesson, search, nav, ui)
lib/            Search (MCP client, hydration, schema, system prompt), formatting helpers
sanity/         Server-only client, fetch helpers, GROQ queries
studio/         Standalone Sanity Studio — schema, seed scripts
prompts/        Approved implementation prompts (one per feature, per AGENTS.md)
```

## Getting started

```bash
cp .env.example .env.local   # fill in Clerk, Sanity, PostHog, and OpenAI keys
npm install
npm run dev                  # web app at http://localhost:3000

npm --prefix studio run dev  # Studio, separately
```

Required environment variables are documented in `.env.example`, including which are safe to expose to the browser and which must stay server-only.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## Notes for contributors

This project follows a documented build process in `AGENTS.md`: every feature starts as an approved implementation prompt in `prompts/` before any code is written, UI is built to exact provided design references, and the server/client and public/private-token boundaries described above are treated as hard rules, not conventions.
