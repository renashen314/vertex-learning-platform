# 08 — Lesson page, wired to seeded Sanity content, video playing

## Goal

Build the lesson page at `/lessons/[slug]`, reproducing `design/vertex-lesson.png`
on desktop and adapting sensibly down to mobile, reading entirely from the live
Sanity `production` dataset through the existing server-only read layer, with
the lesson's YouTube video actually playing on the page.

Explicitly out of scope: real learner progress (completion, resume position),
the Notes tab's persistence, bookmarks, and search. All are presentational or
absent per AGENTS §7 and the confirmed scope call below.

---

## Skills and docs read

| Source | What I took from it |
|---|---|
| `AGENTS.md` §3 | Reference image is the source of truth; adapt responsively, explicitly calling out "collapse the lesson sidebar" on mobile |
| `AGENTS.md` §5, §12 | Pages are read-only; the read token stays server side |
| `AGENTS.md` §7 | Playback is a provider embed — **do not build a custom player**; never send the learner off-site; the Notes tab is presentational with no backend; progress is per-learner state behind a server route this phase does not build |
| `AGENTS.md` §8 | Lesson does not store its course — derive with a reverse reference (already done in the existing query) |
| `AGENTS.md` §9 | YouTube is a supported provider; a provider only counts as supported once both ingestion (not needed here — no video documents involved) and a playback case exist. Vimeo/Bunny have neither in this dataset, so only YouTube playback is built |
| `AGENTS.md` §11 | A result "watches from that second on the lesson page" — the lesson page must accept a start-seconds param so future search cards have somewhere to land |
| `node_modules/next/dist/docs/01-app/01-getting-started/03-layouts-and-pages.md` | `params` and `searchParams` are both Promises on a page component |
| `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md` | `generateMetadata` awaits `params`, server-only |
| `sanity-best-practices` → `references/nextjs.md` | `notFound()` on an empty query result |
| `design/vertex-designsystem.png` | Display 1 (Playfair) is for page titles; badges are pale-fill chips, not solid, outside the two card-badge variants; status glyphs (§10) |

---

## Code and data inspected

| File / source | Relevant state |
|---|---|
| `sanity/queries/lessons.ts` | `LESSON_BY_SLUG_QUERY` already exists and returns everything the design needs: lesson fields, resources, and the reverse-derived `course` with `instructor`, and every module's `lessonIds` (raw order) plus resolved `lessons[]{_id,title,slug,duration}`. **No GROQ change needed.** `LESSON_SLUGS_QUERY` exists for static params. |
| `sanity.types.ts` | `LESSON_BY_SLUG_QUERY_RESULT` is already generated and matches the query above — confirmed by reading it directly. |
| `sanity/lib/lesson-position.ts` | `deriveLessonPosition(modules, lessonId)` is already built for exactly this page: returns `moduleLabel` ("Module 5 of 12"), `lessonLabel` ("Lesson 5.1"), and `previousLessonId`/`nextLessonId`. Unused until now. |
| `lib/format.ts` | `formatDuration`, `formatStudentCount`, `formatLevel` — reused as-is. |
| `components/ui/progress.tsx` | `ProgressBar` renders bar + inline "N% complete" to the right; the sidebar mini-card puts the label above the bar instead, so the sidebar composes the bar (`showLabel={false}`) with its own label rather than reusing the inline layout. |
| `components/ui/status.tsx` | `StatusIndicator` (inProgress/completed/nowPlaying/locked) exists, unused until now, but its label+icon+color combo is heavier than the sidebar's small per-lesson dot. Not reused directly (see Decision 4). |
| `components/ui/badge.tsx` | `popular` variant is a pale peach chip (`bg-primary-100 text-primary-500 rounded-sm`); `lesson`/`video` variants are solid pills reserved for card badges (`LessonCard`/`LessonVideoCard` in `components/ui/card.tsx`) and matched to the design system's §09 Badges/Tags sheet, which shows LESSON as a solid blue chip — a *different* UI element from this page's pale "LESSON 5.1" pill. Not reused or modified; a new small pale chip is built for the lesson header instead. |
| `components/course/course-hero.tsx`, `course-content.tsx`, `course-progress-bar.tsx` | Established patterns this page follows: `formatDuration`/`formatLevel`/`formatStudentCount` usage, the `ModuleNumber` connector-circle pattern (reused conceptually for the sidebar), PostHog capture gated behind `isPostHogConfigured`, presentational buttons for bookmark. |
| `components/nav/breadcrumbs.tsx`, `site-nav.tsx` | Reused as-is. |
| `components/ui/page-chrome.tsx` | `hatchedBackground`/`DecorativeBars` are marketing-page chrome (home, course). The lesson page is an app surface with a persistent sidebar, not a marketing scroll, so it is **not** wrapped in the hatched background — flat `bg-neutral-50` instead. Flagged as a judgment call. |
| `studio/schemaTypes/documents/lesson.ts` | Confirms `notes` (Portable Text) is documented as "shown as Overview", `keyPoints` as the "In this lesson you will" checklist, `resources[].type` is one of `documentation \| guide \| repository`. |
| Live dataset | All 120 seeded lessons use `youtube.com/watch?v=<id>` URLs — confirmed by grep. No Vimeo/Bunny content exists. |
| `package.json` | `@portabletext/react` is **not installed yet**, though AGENTS §6 lists it as the stack for rendering Portable Text. Added by this phase — it is the only new dependency. |
| `next.config.ts` | Only `cdn.sanity.io` is an allowed remote image host. The YouTube video is an `<iframe>`, not `next/image`, so no new host entry is needed. |

---

## Decisions and assumptions

1. **Progress is an honest placeholder — confirmed with the user.** No fabricated
   completion state. The sidebar marks only the lesson actually being viewed as
   "Now Playing" (an orange filled dot + orange text); every other lesson and
   every other module renders in a single neutral state — no invented
   checkmarks for "earlier" modules. The course mini-card's progress bar reads
   0%. The current module's number circle is filled solid orange (a "you are
   here" wayfinding cue, not a completion claim); every other module's circle
   is the same outlined neutral style `course-content.tsx` already uses.

2. **No custom video player — the provider's own YouTube iframe embed.** AGENTS
   §7/§12 are explicit: do not build a custom player, never send the learner
   off-site. The mock's control bar (custom scrubber, "12:45 / 1:28:00", gear
   icon) is a mockup graphic, not a build target — same class of mismatch as
   the course page's font-fallback rendering. The real YouTube iframe chrome
   (its own play button, progress bar, captions, fullscreen) is what ships.
   Consequently the video always starts at 0:00 for a plain visit; there is no
   fabricated 12:45 resume position.

3. **The lesson page accepts a `t` search param (seconds) that sets the embed's
   `start` parameter.** Nothing currently links here with one — search doesn't
   exist yet — but AGENTS §11 describes exactly this contract ("watches from
   that second"), and building the page to honor it now means the search phase
   is a pure linking change, not a lesson-page change. `?t=` is validated as a
   non-negative integer; anything else is ignored rather than erroring.

4. **The sidebar's per-lesson status is a small inline dot, not
   `StatusIndicator`.** `StatusIndicator` always renders a text label
   ("Completed", "Now Playing") sized for a standalone line; the sidebar's
   lesson rows already carry the title as their primary text and need only a
   14px glyph plus the row's own color, matching the mock's compact list.
   Reusing `StatusIndicator` here would print a redundant second label per row.

5. **Route is `app/lessons/[slug]/page.tsx`**, a server component, statically
   parameterised from `LESSON_SLUGS_QUERY`, `notFound()` on a miss (lesson not
   found, or found but not attached to any course — the page has nothing
   coherent to render without a course context).

6. **Previous/next lesson data comes from the already-fetched course**, not a
   second query. `deriveLessonPosition` returns ids; the page builds a flat
   `Map<lessonId, {title, slug, duration}>` from `course.modules[].lessons[]`
   (already resolved by the query) to look up the neighbor's display fields.

7. **Layout is a persistent two-column app shell**, not the marketing
   hatched-background pattern: `SiteNav` full-width at top, then a flex row of
   a fixed-width sidebar (aside, white, right border) and the main content
   (flat `neutral-50`). Both columns scroll together in normal document flow —
   no independent sticky/scroll containers, which the design doesn't clearly
   demand and would add complexity without a clear spec to build to.

8. **Mobile: the sidebar collapses**, per AGENTS §3's own example. Below `lg` it
   is hidden behind a "Course Content" toggle button rendered above the main
   content; opening it shows the same sidebar content inline (not a drawer/
   overlay — simplest correct behavior, no new interaction pattern invented).

9. **The "LESSON 5.1" pill is a new small component**, not a reuse of
   `Badge`'s `lesson` variant (see table above) — a pale peach chip built the
   same way `popular`'s classes are, but as its own element since its content
   (`lessonLabel`) is dynamic text, not a fixed default label like `Badge`
   supports.

10. **Portable Text rendering uses `@portabletext/react` with default
    serializers.** The seeded `notes` content is plain paragraphs (per the
    schema, `block` only, no custom types), so no custom component map is
    needed; default block/mark rendering is styled with Tailwind's typography
    classes already available (`prose` utilities are not installed — instead,
    the existing `text-body`/`leading-relaxed` scale is applied via a thin
    wrapper, keeping in the project's established non-`prose` styling
    approach seen elsewhere).

11. **The Notes tab is a plain uncontrolled `<textarea>`, not state-managed.**
    AGENTS §7 lists it explicitly as presentational with no backend. Both tab
    panels stay mounted and are toggled with `hidden` rather than conditionally
    rendered, so typed text survives switching back to Lesson Content and isn't
    lost — but nothing persists across a reload, and that's correct per scope.

12. **Resource icons**: `documentation` and `guide` reuse the existing
    `IconFileText`; `repository` gets one new glyph, `IconGithub`, added to
    `components/ui/icons.tsx` following the file's existing 24×24/2px-stroke
    convention. `IconLightbulb` is added the same way for the Pro Tip panel.

13. **The previous/next footer bar is static (in normal flow), not fixed.**
    Unlike the course page's floating sticky progress card (rounded, shadowed,
    inset), this bar is flush and full-bleed at the true bottom of the page —
    read as a footer, not an overlay. No bottom page padding reservation is
    needed because nothing is fixed over content.

14. **Keypoints checklist reuses a check-circle glyph** in `primary-500`,
    consistent with the outlined-icon language elsewhere (`OutcomeIcon`,
    `StatusIndicator`'s `CheckCircleIcon`) rather than inventing a new visual
    for the same "done/included" concept.

15. **Bookmark is a small icon-only button** (not the labeled button used on
    the course page), matching the mock's compact top-right control next to
    the title. Presentational, per AGENTS §7.

---

## Files expected to touch

### New
```
app/lessons/[slug]/page.tsx              Route: fetch, metadata, static params, layout
components/lesson/lesson-sidebar.tsx     Client: back-to-course, mini progress, module/lesson list
components/lesson/lesson-header.tsx      LESSON label pill, title, summary, meta row, bookmark
components/lesson/lesson-video.tsx       YouTube iframe embed
components/lesson/lesson-tabs.tsx        Client: Lesson Content / Notes tab switch
components/lesson/lesson-resources.tsx   Resource card grid
components/lesson/lesson-footer-nav.tsx  Previous/Next lesson bar
components/lesson/types.ts               Query-result slices as component props
lib/youtube.ts                           Parse a YouTube URL -> embed URL with optional start seconds
prompts/08-lesson-page.md                This file
```

### Modified
```
components/ui/icons.tsx    add IconGithub, IconLightbulb, IconCheckCircle (if not already reusable)
package.json / package-lock.json   add @portabletext/react
```

`sanity/queries/lessons.ts`, `sanity.types.ts`, and the seed files are not
touched — the existing query already returns everything required.

---

## Requirements

**Route**
1. `export default async function Page(props: PageProps<'/lessons/[slug]'>)`,
   awaiting `props.params` and `props.searchParams`.
2. `generateStaticParams` from `LESSON_SLUGS_QUERY`, filtering nulls.
3. `generateMetadata` sets title from the lesson title (+ course title) and
   description from the lesson summary; generic fallback when not found.
4. `notFound()` when the query returns null or `course` is null.
5. Data fetched once via `sanityFetch`, `tags: ['lesson', 'course']`.
6. Client components receive only plain serialisable props — no image builder,
   no Sanity client, crossing the boundary.

**Layout, against the reference image**
7. `SiteNav showUserControls` full width at top.
8. Below it: sidebar (fixed ~310px on `lg+`, white, right border) + main content
   (flat `neutral-50`, centered column, generous padding).
9. Sidebar: "← Back to course" link to `/courses/[courseSlug]`; mini course
   card (cover-derived initial tile or thumbnail, title, "0% complete" +
   `ProgressBar`); the module list, current module expanded by default with
   its lessons visible, others collapsed and independently toggleable.
10. Breadcrumbs: All Courses → course title → module title → lesson title,
    following `deriveLessonPosition`'s labels; only "All Courses" and the
    course title are links.
11. Lesson header: pale "LESSON {m.n}" pill, title (Playfair, Display 1 scale,
    same treatment as the course page's `h1`), summary, meta row (level,
    duration, student count, each icon-led, each dropped when absent), small
    bookmark icon button top-right.
12. Video: 16:9 YouTube iframe below the header.
13. Tabs: "Lesson Content" (active by default, orange underline) / "Notes".
    Lesson Content panel: "Overview" heading + Portable Text `notes`; "In this
    lesson you will" checklist from `keyPoints`; Pro Tip panel (lightbulb icon)
    when `proTip` is present; "Resources" heading + resource grid when
    `resources` is non-empty. Notes panel: a single presentational textarea.
14. Footer: static, full-bleed bar — Previous Lesson (title + duration, or
    disabled/hidden at the course's first lesson) on the left, Next Lesson
    (primary-styled, title + duration, or disabled/hidden at the course's last
    lesson) on the right.

**Behaviour**
15. The sidebar's module accordion is keyboard-operable with
    `aria-expanded`/`aria-controls`, same contract as `course-content.tsx`.
16. The video's `start` param comes from a validated `?t=` query param (seconds,
    non-negative integer), defaulting to unset/0.
17. The Lesson Content / Notes tabs are keyboard-operable
    (`role="tablist"`/`role="tab"`/`aria-selected`), both panels stay mounted.
18. Previous/Next footer links navigate via `next/link` and fire a PostHog
    `lesson_selected`-style capture consistent with the course page's pattern,
    gated behind `isPostHogConfigured`.

**Responsive**
19. Below `lg`, the sidebar collapses behind a toggle button shown above the
    main content; opening it reveals the same content inline.
20. Header meta row wraps; video stays 16:9 at any width; footer nav stacks to
    two full-width rows below `sm`.
21. No horizontal scroll at 375px.

**Data honesty**
22. Every string/number comes from the query except the fixed labels ("Lesson
    Content", "Notes", "Your Progress"-equivalent sidebar label, "0%").
23. Nullable fields degrade: missing summary/proTip/resources/keyPoints hide
    their section rather than rendering empty chrome; a lesson whose `videoUrl`
    does not parse as a YouTube URL renders a neutral fallback panel instead of
    crashing.

---

## Security considerations

- The page is a server component; the read token stays inside the `server-only`
  Sanity client. No new code imports `sanity/lib/client` or `sanity/env` from
  the browser.
- Client components (`lesson-sidebar`, `lesson-tabs`) receive plain
  serialisable props only.
- The YouTube iframe `src` is built only from a parsed, known-good video id
  (regex-extracted from the stored `videoUrl`, never the raw stored string
  interpolated directly) and the standard `youtube-nocookie.com`/`youtube.com`
  embed origin — never a user-controlled or externally supplied host.
- The `t` search param is parsed with `Number()` + integer/non-negative
  validation before use; an invalid value is dropped rather than passed
  through to the iframe URL.
- No writes, no route handlers, no new tokens. Bookmark and Notes are inert.
- Lesson/course/module identifiers are interpolated into `href`s only, never
  into GROQ — the slug reaches the query as a bound `$slug` parameter.

---

## Acceptance criteria

1. `/lessons/data-fetching-caching` (or the seeded equivalent slug) renders the
   full page from live Sanity content, matching the reference image on desktop,
   modulo the confirmed video-player and progress deviations.
2. The video actually plays: the YouTube iframe loads and is playable in the
   browser for a seeded lesson.
3. Sidebar shows the current lesson as the only "Now Playing" row; no other
   row/module shows a fabricated completed state; the mini progress bar reads
   0%.
4. Expanding a non-current module reveals its lessons; collapsing works;
   keyboard operable.
5. Breadcrumbs read All Courses → course title → module title → lesson title.
6. Lesson Content tab shows Overview text, the keypoints checklist, Pro Tip
   (when present), and Resources (when present). Notes tab shows an editable,
   non-persisted textarea.
7. Previous/Next footer correctly resolves neighbor lessons across module
   boundaries (e.g., the last lesson of module 4 → first lesson of module 5),
   and is absent/disabled at the course's first/last lesson.
8. `?t=765` on a lesson URL starts the embedded video at 12:45; an absent or
   invalid `t` starts at 0:00.
9. An unknown slug 404s; a lesson with no attached course 404s.
10. No horizontal scroll at 375px; sidebar collapses behind a toggle below `lg`.
11. Type check, lint, and production build all pass.

---

## Checks to run

Reported with real output, never assumed:

```bash
# web (repo root)
npm install                 # adds @portabletext/react
npx tsc --noEmit
npm run lint
npm run build                # routes and components changed

# boundary check
grep -rn "SANITY_API_READ_TOKEN" app components lib && echo "LEAK" || echo "clean"
```

---

## Manual test steps

1. `npm run dev`, open `http://localhost:3000/lessons/<a-seeded-lesson-slug>`
   (find one via `sanity documents query '*[_type=="lesson"][0].slug.current'`
   or by following a link from a course page once one exists).
2. Confirm the video loads and can be played, paused, and scrubbed using
   YouTube's own controls.
3. Compare header, sidebar, tabs, and footer against
   `design/vertex-lesson.png`, noting the two confirmed deviations (real
   YouTube chrome instead of the mock's custom bar; 0%/neutral progress
   instead of the mock's fabricated completion state).
4. Click "Back to course" → lands on `/courses/[slug]`.
5. Collapse/expand a non-current module in the sidebar; tab to it and toggle
   with Enter/Space.
6. Switch to the Notes tab, type something, switch back to Lesson Content,
   switch to Notes again → text is still there (same session); reload the
   page → it's gone (not persisted, as scoped).
7. Click Next Lesson repeatedly from the course's first lesson through its
   last; confirm module boundaries are crossed correctly and the button is
   absent/disabled at the very last lesson. Same for Previous from the first.
8. Visit the same lesson with `?t=300` appended → video starts at 5:00.
9. Visit `/lessons/does-not-exist` → 404.
10. Narrow to 375px → sidebar is collapsed behind a toggle, no horizontal
    scroll, video stays 16:9, footer nav stacks.

---

## Needs your attention (carried into the report)

- The video player is YouTube's real iframe chrome, not the mock's custom
  control bar — required by AGENTS §7/§12's "do not build a custom player"
  rule.
- Sidebar/mini-bar progress reads 0% / neutral throughout, per your answer —
  no fabricated completion state, unlike the mock.
- The Notes tab does not persist anything (no backend exists for it, per
  AGENTS §7) — text is lost on reload.
- Bookmark stays presentational, same as the course page.
