# Prompt 03 — Sanity Content Model, Studio, and Server-Side Data Layer

## Goal

Stand up the Vertex content model in a **standalone Sanity Studio workspace** (`studio/`) with five types — `course`, `module` (embedded object), `lesson`, `instructor`, `category` — and build the **server-only** read client, fetch helper, GROQ queries, and generated types in the web workspace.

No UI, no pages, no routes. This prompt ends with a typed data layer that page work can consume.

Explicitly **out of scope** (later phases, per AGENTS.md §8/§9/§10): the `video` document, the `progress` record, the agent Context document, ingestion tooling, and the search route.

---

## Skills read

| Skill | What I took from it |
|---|---|
| `sanity-best-practices` → `references/schema.md` | `defineType`/`defineField`/`defineArrayMember` everywhere; data-over-presentation naming; reference-vs-object decision matrix; let Sanity generate `_id`; validation patterns |
| `sanity-best-practices` → `references/project-structure.md` | Monorepo shape: standalone `studio/` beside the frontend; kebab-case filenames; `documents/` + `objects/` split |
| `sanity-best-practices` → `references/typegen.md` | TypeGen config lives in `sanity.cli.ts` (not `sanity-typegen.json`); cross-workspace `path`/`generates`; queries must be `defineQuery`-assigned to uniquely-named consts; `sanity.types.ts` must be in tsconfig `include` |
| `sanity-best-practices` → `references/nextjs.md` | Standalone Studio rationale + migration steps from embedded; `useCdn` trade-off; `notFound()` on empty result; error table (401 token / 403 CORS) |
| `node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md` | Next 16: `fetch` is **not** cached by default; Server Components can hold credentials safely |
| `node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md` | `use cache` / `cacheLife` only apply when `cacheComponents: true` is set in `next.config.ts` |
| `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md` | With Cache Components off (our case), `next: { revalidate, tags }` + `revalidateTag` is the supported model |

---

## Code inspected

| File | Relevant state |
|---|---|
| `sanity.config.ts`, `sanity.cli.ts` (root) | Uncommitted `sanity init` output, configured for an **embedded** Studio (`basePath: '/studio'`) |
| `app/studio/[[...tool]]/page.tsx` | Uncommitted `<NextStudio />` mount — the embedded Studio route |
| `sanity/schemaTypes/index.ts` | `types: []` — empty, nothing to preserve |
| `sanity/lib/client.ts` | `createClient` with `useCdn: true`, **no token**, not server-guarded |
| `sanity/lib/live.ts` | `defineLive` scaffold — unused, and would require a browser token |
| `sanity/lib/image.ts` | `urlFor` builder — correct as-is, keep |
| `sanity/env.ts` | Asserts `NEXT_PUBLIC_SANITY_PROJECT_ID` / `_DATASET`; `apiVersion` defaults `2026-09-01` |
| `app/layout.tsx` | `ClerkProvider` + fonts. No Sanity wiring. Untouched by this prompt |
| `proxy.ts` | `clerkMiddleware()`, matcher excludes `_next` and static assets |
| `next.config.ts` | Empty — no `images.remotePatterns`, no `cacheComponents` |
| `package.json` | Web deps include `sanity`, `@sanity/vision`, `styled-components` (only needed by the embedded Studio) |
| `.gitignore` | `.env*` — currently blocks the required committed `.env.example` |
| `.env.local` | Has Clerk keys + `NEXT_PUBLIC_SANITY_PROJECT_ID` / `_DATASET`. **No `SANITY_API_READ_TOKEN`** |
| `tsconfig.json` | `include` is broad (`**/*.ts`), `paths: {"@/*": ["./*"]}`, excludes `agent`, `.agents`, `.claude` |
| `grep sanity app/ components/` | Only the studio route matches. Nothing committed depends on any of this |
| `design/vertex-course.png` | Course: popular pill, title, summary, level, total duration, module count, student count, 4 learning outcomes (icon + title + description), module list (number, title, summary, duration) |
| `design/vertex-lesson.png` | Lesson: `LESSON 5.1` label, title, summary, duration, level, student count, video, Overview prose, "In this lesson you will" checklist, Pro Tip callout, Resources (icon type, title, description, external link) |
| `node_modules/@sanity/icons/package.json` | Resolved version **3.8.0**, `exports` map has **only** `"."` — no subpaths |

---

## Decisions and assumptions

### 1. The embedded Studio is replaced by a standalone `studio/` workspace

AGENTS.md §5 requires two standalone workspaces and §6 forbids an embedded Studio; §12 notes the Context MCP only serves a dataset with a **deployed Studio application**, which is `sanity deploy` from a standalone Studio. The `sanity-best-practices` `nextjs.md` migration steps say the same.

So: delete the root `sanity.config.ts`, root `sanity.cli.ts`, `sanity/schemaTypes/`, `sanity/structure.ts`, and `app/studio/`, and rebuild them under `studio/`.

All of that is **uncommitted, unreferenced scaffolding with an empty schema** — nothing of the user's authored work is lost.

### 2. The web workspace stays at the repo root

`project-structure.md` draws `studio/` + `web/`. Moving `app/`, `components/`, `app/globals.css`, and the committed home-page work into `web/` is a large refactor that this prompt does not need and would churn every path in the repo. The repo root **is** the web workspace; `studio/` is added beside it. That preserves the property that matters — independent deploys, Vite-based Studio dev, Studio auto-updates, TypeGen — with no churn.

### 3. No Live Content API — a plain server-only client + fetch helper

The `defineLive` scaffold in `sanity/lib/live.ts` needs a `browserToken` to work against a private dataset. AGENTS.md §5 and §12 are unambiguous: *"The browser holds no token"*, *"fetch all content server side"*. So `live.ts` is deleted and replaced by:

- `sanity/lib/client.ts` — `import 'server-only'`, `token: readToken`, `useCdn: false`, `perspective: 'published'`.
- `sanity/lib/fetch.ts` — `sanityFetch({ query, params, revalidate, tags })` wrapper.

`useCdn: false` because the dataset is private and Next.js is already doing the caching; the Sanity CDN would add a second, uninvalidatable staleness layer on top of our tags.

### 4. Caching uses the pre-Cache-Components model

`next.config.ts` does not set `cacheComponents: true`, so `use cache` / `cacheLife` are unavailable and Next 16 does not cache `fetch` by default. The helper passes `next: { revalidate, tags }` explicitly. Default `revalidate: 3600`; every query carries type tags (`course`, `lesson`, `instructor`, `category`) so a later webhook route can `revalidateTag`. **This prompt does not add a revalidate webhook route** — that is page-phase work.

### 5. `@sanity/icons` import style is version-dependent

`schema.md` says to import icons from subpaths (`@sanity/icons/Tag`), which is correct for v5. The **resolved version here is 3.8.0, whose `exports` map has no subpaths** — a subpath import type-checks and then fails at bundle time.

The `studio/` workspace installs its own `@sanity/icons`. The implementation must read `studio/node_modules/@sanity/icons/package.json` **after install** and use root named imports for v3/v4, subpath imports for v5+. Do not assume.

### 6. Field-shape decisions

| Decision | Rationale |
|---|---|
| Durations stored as `durationSeconds: number` on `lesson` | AGENTS.md says lessons have "a duration". Seconds is the data; `1h 28m` is presentation. Also lets the course total (`18h 24m`) and the module total (`1h 28m`) be **derived by summing**, never stored twice |
| `level` lives on `course` only, not `lesson` | The lesson design shows "Intermediate", but AGENTS.md §8 lists `level` under course and not lesson. A lesson's level is its course's level; duplicating it invites drift. The lesson page reads it via the reverse reference it already needs for the breadcrumb |
| `learningOutcome.icon` is a `string` from a fixed `options.list` | AGENTS.md names the field "icon". Storing a key (`layers`, `database`, `gauge`, `cloud`) rather than an SVG keeps it data, and the frontend owns the glyph |
| `resource.type` is a `string` from a fixed `options.list` | `documentation` / `guide` / `repository`, matching the three cards in the lesson design |
| `keyPoints` is `array of string` | The "In this lesson you will" checklist items are plain lines with no formatting in the design |
| `proTip` is `text`, optional | One short paragraph in the design |
| `notes` is Portable Text (`array of block`) | AGENTS.md §7: content is Portable Text, never markdown. Renders as the "Overview" body |
| `bio` is Portable Text; `expertise` is `array of string` | The instructor gets a full page (§1), so the bio needs real rich text |
| `popular` and `freePreview` stay booleans | `schema.md` prefers `options.list` for states that may expand, but AGENTS.md §8 explicitly calls both "flags". They are binary display markers, not states |
| `studentCount` / `price` are plain numbers with `rule.min(0)` | §7 calls these display-only marketing fields |
| `module` is an embedded object inside `course` | AGENTS.md §8, and it satisfies `schema.md`'s matrix: a module is document-specific and never shared |
| `module.lessons` is an array of **references** | Lessons are documents with their own routes and are queried independently by search |
| `lesson` stores **no** parent course | AGENTS.md §8. The course is derived with `references(^._id)` |
| No `order`/`number` fields anywhere | AGENTS.md §8: "Module 5", "Lesson 5.1" are derived from array order |

### 7. Position labels are derived in TypeScript, not GROQ

Computing "which index is this lesson, inside which module" in GROQ is convoluted. `sanity/lib/lesson-position.ts` exports a pure `deriveLessonPosition(modules, lessonId)` returning `{ moduleIndex, lessonIndex, moduleLabel: 'Module 5 of 12', lessonLabel: 'Lesson 5.1' }` (1-based). Included here because it is the direct consequence of decision 6's "derive, don't store", and the lesson query is shaped to feed it.

### 8. TypeGen is configured but generated types are committed

`studio/sanity.cli.ts` gets `typegen: { enabled: true, path: '../{app,components,sanity}/**/*.{ts,tsx}', schema: 'schema.json', generates: '../sanity.types.ts' }`. The `path` glob is explicit rather than `../**/*` so it never walks `node_modules`.

Per `typegen.md` Option A, `sanity.types.ts` is committed so `npm run typecheck` works right after a clone with no Studio install. `studio/schema.json` is also committed for the same reason. Extraction runs **without** `--enforce-required-fields`: required fields can legitimately be absent in drafts, and forcing them non-optional would produce types that lie.

`tsconfig.json` already includes `**/*.ts`, so `sanity.types.ts` is picked up with no change. `studio/` must be added to tsconfig `exclude` so the web type-check does not try to compile Studio sources against web deps.

### 9. Env and secrets

- `SANITY_API_READ_TOKEN` is added to `sanity/env.ts` as a **non-`NEXT_PUBLIC_`** var, read only in the `server-only` client module.
- A committed `.env.example` becomes the canonical list (AGENTS.md §12). `.gitignore` gains `!.env.example`.
- `studio/.env.example` lists `SANITY_STUDIO_PROJECT_ID` / `SANITY_STUDIO_DATASET` (Vite's prefix; the Studio does not read `NEXT_PUBLIC_*`).
- **The token is not created by this prompt.** Creating an API credential is the user's call — it is listed under "Needs your attention" with the exact command.

---

## Files expected to touch

### Deleted (all uncommitted scaffolding)
```
sanity.config.ts
sanity.cli.ts
sanity/structure.ts
sanity/schemaTypes/index.ts
sanity/lib/live.ts
app/studio/[[...tool]]/page.tsx
```

### New — `studio/` workspace
```
studio/package.json
studio/tsconfig.json
studio/.gitignore
studio/.env.example
studio/sanity.config.ts
studio/sanity.cli.ts
studio/structure.ts
studio/schemaTypes/index.ts
studio/schemaTypes/documents/course.ts
studio/schemaTypes/documents/lesson.ts
studio/schemaTypes/documents/instructor.ts
studio/schemaTypes/documents/category.ts
studio/schemaTypes/objects/module.ts
studio/schemaTypes/objects/learning-outcome.ts
studio/schemaTypes/objects/lesson-resource.ts
studio/schema.json           (generated, committed)
```

### New — web data layer
```
sanity/lib/fetch.ts
sanity/lib/lesson-position.ts
sanity/queries/courses.ts
sanity/queries/lessons.ts
sanity/queries/instructors.ts
sanity/queries/categories.ts
sanity.types.ts              (generated, committed)
.env.example
```

### Modified
```
sanity/env.ts        — add readToken
sanity/lib/client.ts — server-only, token, useCdn:false, published perspective
package.json         — drop sanity/@sanity/vision/styled-components; add server-only; add typecheck + typegen scripts
tsconfig.json        — exclude "studio"
next.config.ts       — images.remotePatterns for cdn.sanity.io
.gitignore           — !.env.example
```

---

## Requirements

**Schema**
1. `defineType` / `defineField` / `defineArrayMember` on every type, field, and array member.
2. Every document and object type gets an icon, imported in the style the resolved `@sanity/icons` version supports (decision 5).
3. Every type gets a `preview` with a useful `subtitle` — module previews show the lesson count, lesson previews show the duration.
4. All slugs: `source` set, `maxLength: 96`, `rule.required()`.
5. `course.modules` and `module.lessons` require `min(1)`; `module.lessons` requires `.unique()`.
6. Images use `options: { hotspot: true }` and carry a required `alt` string field.
7. Field ordering in the Studio follows the design's reading order: identity → marketing → relationships → content.
8. No `order`, `number`, or `moduleNumber` fields. No `course` field on `lesson`.

**Structure**
9. `studio/structure.ts` renders an explicit ordered list — Courses, Lessons, Instructors, Categories — not `S.documentTypeListItems()`.

**Client and fetch helper**
10. `sanity/lib/client.ts` starts with `import 'server-only'`. It must be impossible to import from a client component.
11. The read token is never referenced outside that module and is never prefixed `NEXT_PUBLIC_`.
12. `sanityFetch` signature: `{ query, params?, revalidate?, tags? }`, defaulting `revalidate: 3600`, passing `{ next: { revalidate, tags } }` through to `client.fetch`.

**Queries**
13. Every query uses `defineQuery` assigned to a uniquely-named `SCREAMING_SNAKE_CASE` const (TypeGen requirement).
14. Every array projection includes `_key`.
15. References are projected explicitly (`instructor->{name, slug, photo}`), never with a bare `->`.
16. No query returns a whole Portable Text body it does not need — the catalog query selects only card fields.
17. Queries to write:
    - `COURSES_CATALOG_QUERY` — all courses, card fields, category + instructor names, derived total duration and lesson count.
    - `COURSE_SLUGS_QUERY` / `LESSON_SLUGS_QUERY` / `INSTRUCTOR_SLUGS_QUERY` — for `generateStaticParams`.
    - `COURSE_BY_SLUG_QUERY` — full course incl. `learningOutcomes[]`, `modules[]{ _key, title, summary, lessons[]->{...} }`, instructor, category.
    - `LESSON_BY_SLUG_QUERY` — full lesson incl. `notes`, `keyPoints`, `proTip`, `resources[]`, **plus** the parent course derived via `*[_type == "course" && references(^._id)][0]` projecting `title`, `slug`, `level`, `coverImage`, and `modules[]{ _key, title, "lessonIds": lessons[]._ref }` so `deriveLessonPosition` can compute the label and prev/next.
    - `INSTRUCTOR_BY_SLUG_QUERY` — instructor + the courses that reference them.
    - `CATEGORIES_QUERY`.

**Types**
18. `sanity.types.ts` regenerates cleanly and the web type-check passes against it.

---

## Security considerations

- `SANITY_API_READ_TOKEN` is server-only, reachable only through the `server-only`-guarded client module. A stray import from a client component becomes a **build error**, not a silent leak.
- No write token and no write path is introduced here. Nothing in this prompt mutates content.
- The dataset stays private; `perspective: 'published'` keeps unpublished drafts out of every response.
- Only `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, and `NEXT_PUBLIC_SANITY_API_VERSION` may reach the browser — all non-secret by design.
- `.env.example` carries **key names with empty values only**, never a real value.
- Deleting `app/studio/` also removes an authenticated surface from the Next.js app's origin and shrinks the client bundle.
- `next.config.ts` `remotePatterns` is scoped to `cdn.sanity.io` exactly, not a wildcard host.

---

## Acceptance criteria

1. `studio/` is a standalone workspace; the repo contains no `app/studio` route and no root `sanity.config.ts`.
2. `sanity schemas extract` in `studio/` (CLI 6.7.2 dropped the `--force` flag) emits a `schema.json` containing exactly: `course`, `lesson`, `instructor`, `category`, `module`, `learningOutcome`, `lessonResource`.
3. `sanity typegen generate` writes `sanity.types.ts` at the repo root with a named result type per query and no `unknown` result types.
4. Web type-check passes. Web lint passes. Web production build succeeds.
5. `grep -rn "SANITY_API_READ_TOKEN" app components` returns nothing.
6. `sanity dev` in `studio/` boots and all four document types are creatable, with every field rendering and validation firing on empty required fields.
7. `.env.example` exists, is tracked by git, and lists every variable the app reads.
8. No page, route, or component behavior changes — the existing home page renders exactly as before.

---

## Checks to run

Reported with real output, never assumed:

```bash
# web (repo root)
npx tsc --noEmit
npm run lint
npm run build

# studio
cd studio && npm install
npx sanity schemas extract
npx sanity typegen generate
npx sanity dev          # boot check, then stop

# secret leak check
grep -rn "SANITY_API_READ_TOKEN" app components && echo "LEAK" || echo "clean"
```

`sanity deploy` and content import are **not** run here — see "Needs your attention".

---

## Manual test steps

1. `cd studio && npm run dev` → open `http://localhost:3333`.
2. Confirm the left pane lists exactly **Courses, Lessons, Instructors, Categories** in that order.
3. Create a Category "Web Development". Create an Instructor "Sarah Chen" with a photo, two expertise tags, and a bio paragraph.
4. Create two Lessons. On the first, fill title, slug, summary, video URL, thumbnail, `durationSeconds: 5280`, three key points, a pro tip, two paragraphs of notes, and one resource of each type. Leave the second minimal.
5. Confirm the Lessons list subtitle shows a formatted duration, not a raw number.
6. Create a Course "Next.js for Production" → pick the instructor and category, add four learning outcomes, then add one module titled "Data Fetching & Caching" referencing both lessons.
7. Try to save the course with an empty `modules` array → the `min(1)` validation error must appear.
8. Confirm the course document has **no** field for "module number" or "lesson number", and the lesson has **no** field for its parent course.
9. In Vision, run `*[_type == "lesson"][0]{..., "course": *[_type == "course" && references(^._id)][0]{title}}` → the parent course resolves.
10. Back at the repo root, run `npx tsc --noEmit` → passes, and `sanity.types.ts` contains `COURSE_BY_SLUG_QUERYResult`.
11. `npm run dev` → the home page at `http://localhost:3000` renders unchanged, and `http://localhost:3000/studio` now 404s.

---

## Known blockers for the user

- **`SANITY_API_READ_TOKEN` does not exist yet.** Every query returns 401 against the private dataset until it is created and added to `.env.local`. Creating an API credential is the user's decision, not mine.
- **The Studio is not deployed.** AGENTS.md §12 requires a deployed Studio *application* before the Context MCP will serve the dataset. That is a prerequisite for the search phase, not this one.
- **The Sanity MCP server is unauthorized in this session**, so content documents cannot be created or imported programmatically here.
