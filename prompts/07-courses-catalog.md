# 07 — All Courses catalog page

## Goal

Build `/courses`: every course in the dataset, in the card grid the home page
already uses. Deliberately simple — no filters, no sort, no pagination, no
search.

This closes the dead "All Courses" / "Explore Courses" / "View all courses"
links left by prompts 05 and 06.

---

## Code and data inspected

| File / source | Relevant state |
|---|---|
| `design/` | Holds home, course, lesson, search and design-system images. **There is no catalog reference image**, so there is no visual to reproduce — the page is assembled from existing patterns rather than designed |
| `app/page.tsx` | Renders the course grid inline: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6` inside `max-w-5xl`, card = cover tile + title + summary + meta footer, wrapped in a `Link` |
| `sanity/queries/courses.ts` | `COURSES_CATALOG_QUERY` returns every course, card fields only, ordered `popular desc, title asc`. **No GROQ change needed** |
| `components/ui/card.tsx` | Exports an unrelated, unused `CourseCard` from the design-system phase — a different layout (icon left, text right). Not what the home page renders, so not what the catalog should render |
| `components/nav/breadcrumbs.tsx` | Exists; the course page already links "All Courses" → `/courses` |
| `components/nav/pagination.tsx` | Exists but is not needed: the dataset holds 10 courses |
| `lib/format.ts`, `sanity/lib/image.ts` | Formatting and image URL helpers already in use by the home cards |

---

## Decisions and assumptions

1. **The home page's card is extracted, not re-implemented.** It moves to
   `components/course/course-card.tsx` and both pages render it, so the two
   grids cannot drift. Markup and classes are preserved verbatim — the home page
   must look unchanged.

2. **No design image means no invention.** The page is a heading, a count, and
   the same grid. Nothing new is styled.

3. **All courses on one page.** Ten courses is one screen's worth; pagination
   would be scaffolding for a problem the data does not have. The existing
   `Pagination` component stays unused.

4. **Page chrome matches the course detail page** — hatched background, `SiteNav`
   with user controls — so moving between `/courses` and `/courses/[slug]` does
   not change the ground. The grid keeps the home page's `max-w-5xl` width, which
   is what its three-column layout is sized for.

5. **No breadcrumb.** `/courses` is a top-level destination; a breadcrumb reading
   just "All Courses" would say nothing.

6. **The count is derived** from the returned array, not stored.

7. **The new component is named `CourseCard`**, same as the unused export in
   `components/ui/card.tsx`. Different modules, and the path disambiguates them;
   the dead one is left alone rather than deleted as drive-by scope.

---

## Files expected to touch

### New
```
app/courses/page.tsx                  Route: fetch, metadata, heading, grid
components/course/course-card.tsx     The card, lifted from app/page.tsx
prompts/07-courses-catalog.md         This file
```

### Modified
```
app/page.tsx    render the shared card instead of its inline copy
```

No query, schema, or generated-type changes.

---

## Requirements

1. Server component; one `sanityFetch` of `COURSES_CATALOG_QUERY` with
   `tags: ['course', 'lesson']`.
2. `generateMetadata` is unnecessary — a static `metadata` export suffices, since
   nothing about the title depends on the data.
3. Every course in the dataset renders, in the query's order.
4. Cards link to `/courses/[slug]`, are keyboard reachable, and show a visible
   focus ring.
5. Heading reads "All Courses" with the count beside it.
6. Empty dataset renders an empty state pointing back home, not a bare heading.
7. The home page renders identically to before the extraction.
8. Responsive: 1 column below `sm`, 2 at `sm`, 3 at `lg` — the home grid's own
   breakpoints, unchanged.

---

## Security considerations

- Server component; the read token stays inside the `server-only` client.
- Images stay on `cdn.sanity.io`, already covered by `remotePatterns`.
- Slugs are interpolated into `href`s only, never into GROQ.

---

## Acceptance criteria

1. `/courses` lists all 10 seeded courses with real titles, summaries, levels,
   durations and module counts.
2. Every card opens its course page.
3. "All Courses" on a course page, and "Explore Courses" / "View all courses" on
   the home page, all now resolve instead of 404ing.
4. The home page is visually unchanged.
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

1. `npm run dev`, open `http://localhost:3000/courses` → 10 cards, count reads 10.
2. Click a card → its course page opens; its "All Courses" breadcrumb returns here.
3. From `/`, "View all courses" and "Explore Courses" both land here.
4. Narrow to 375px → single column, no horizontal scroll.
5. `/` looks exactly as it did before.
