# 06 — Home page course cards from Sanity

## Goal

Replace the hardcoded three-course array on the home page with the real seeded
courses, read through the existing server-only data layer. Layout, spacing and
type stay exactly as they are — only the source of the data changes.

Out of scope: the `/courses` catalog page, the search bar's behaviour, and the
hero.

---

## Code and data inspected

| File / source | Relevant state |
|---|---|
| `app/page.tsx` | A module-level `courses` array of three invented courses (Next.js for Production, Docker Essentials, TypeScript Deep Dive), and a `CourseIcon` that switches on those hardcoded ids to draw an "N" tile, a whale emoji, and a blue "TS" tile. The cards are `div`s and link nowhere |
| `sanity/queries/courses.ts` | `COURSES_CATALOG_QUERY` already projects every field the card shows — `title`, `slug`, `summary`, `coverImage`, `level`, `moduleCount`, derived `duration` — ordered `popular desc, title asc`. **No GROQ change needed** |
| `sanity.types.ts` | `COURSES_CATALOG_QUERY_RESULT` matches that projection |
| `lib/format.ts` | `formatDuration` and `formatLevel` already exist from prompt 05 |
| `design/vertex-home.png` | Three cards, each a 64px rounded tile, title, two-line summary, and a footer meta row of level / duration / modules. "View all courses →" sits right of the "All Courses" heading |
| Live dataset | 10 courses. Cover images are 16:9 photos on `cdn.sanity.io` |

---

## Decisions and assumptions

1. **The page becomes an async server component** and fetches once via
   `sanityFetch`, with `tags: ['course', 'lesson']` — `lesson` because the card's
   duration and module count are summed from lessons, so a lesson edit should
   invalidate the home page too.

2. **Three cards, sliced in TypeScript.** The design shows three above a "View
   all courses" link. `COURSES_CATALOG_QUERY` is the shared catalog query and
   should stay uncapped for the catalog page that will use it; ten card-sized
   records is a trivial payload, so the home page takes the first three rather
   than forking the query. The ordering (`popular desc, title asc`) already means
   those three are the popular ones.

3. **The tile shows the course's cover image.** The design's tiles are brand
   marks — artwork the content model does not have. The nearest true field is
   `coverImage`, rendered square in the same 64px rounded tile. When a course has
   no cover, it falls back to a neutral-900 tile with the course's initial,
   matching the fallback the course page already uses.

4. **Cards become links** to `/courses/[slug]`, which now exists. The design
   gives no hover state, so the card keeps its border and gains only a subtle
   shadow lift on hover.

5. **The hero, its CTA, and "View all courses" are untouched.** Both still point
   at `/courses`, which remains a future route.

6. **The invented course data is deleted, not kept as a fallback.** A stale
   fallback would silently render fiction if a fetch failed. With no courses, the
   grid renders nothing and the section header still stands.

---

## Files expected to touch

```
app/page.tsx                          fetch, map, tile, link; drop the array
prompts/06-home-courses-from-sanity.md  this file
```

No query, schema, type, or component file changes.

---

## Requirements

1. No hardcoded course title, summary, level, duration, or module count survives
   in `app/page.tsx`.
2. Level and duration are formatted with `formatLevel` / `formatDuration` from
   `lib/format.ts` — not re-implemented.
3. Each card links to its course page and is keyboard reachable with a visible
   focus ring.
4. Card visuals — grid, spacing, border, radius, type sizes, meta row — are
   unchanged from the current implementation.
5. Nullable fields degrade: no cover falls back to the initial tile; a missing
   level, duration, or module count drops that meta item rather than rendering a
   zero.
6. The page stays a server component; the read token does not move.

---

## Security considerations

- Fetching moves into the page, which is already a server component; the
  `server-only` client and its token stay server side.
- Only `cdn.sanity.io` images are loaded, already covered by the existing
  `remotePatterns`.
- Slugs are interpolated into `href`s only, never into GROQ.

---

## Acceptance criteria

1. The home page shows three real seeded courses with their real titles,
   summaries, levels, durations and module counts.
2. Clicking a card opens that course's page.
3. `grep` for the old titles ("Docker Essentials", "TypeScript Deep Dive") in
   `app/` returns nothing.
4. The section's layout is visually unchanged apart from the tiles now showing
   cover art.
5. Type check, lint, and production build pass.

---

## Checks to run

```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Manual test steps

1. `npm run dev`, open `http://localhost:3000/`.
2. The three cards read as real seeded courses, with durations that match those
   courses' lesson sums.
3. Click the first card → its course page opens.
4. Narrow to 375px → the grid stacks as before.
