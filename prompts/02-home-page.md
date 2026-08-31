# Prompt 02 — Vertex Home Page

## Goal

Implement the Vertex home page exactly as shown in `design/vertex-home.png`. Reuse existing design-system components from `components/`. Do not add features or components beyond what is visible in the reference.

---

## Skills read

None required — this is a UI composition task over already-built primitives.

---

## Code inspected

| File | Relevant state |
|---|---|
| `app/page.tsx` | Current placeholder (logo + "Coming soon") — will be replaced |
| `components/nav/site-nav.tsx` | Logo + nav links only; missing right-side bell + avatar |
| `components/ui/button.tsx` | `Button` with `primary` variant ready |
| `components/ui/input.tsx` | `TextInput` with `showSearchIcon` + `shortcut` props ready |
| `components/ui/card.tsx` | `CourseCard` has icon beside text (horizontal flex) |
| `components/ui/badge.tsx` | `Badge` — filled variants only; outlined not yet built |
| `app/globals.css` | All tokens in place: `neutral-50 = #FAFAFC`, `primary-500 = #F97316` |

---

## Decisions and assumptions

1. **`SiteNav` is updated** to accept an optional `showUserControls` boolean prop. When true, a bell icon and a placeholder avatar circle render on the right side. Avatar uses a static `bg-neutral-200` placeholder (no `<Image>` from a URL — avoids requiring `next.config` domain allowlist).

2. **Hero card layout** — the card icons in the design sit ABOVE the card text (stacked), not beside it. The existing `CourseCard` component uses a horizontal flex layout and is correct for detail pages. For the home page grid, course card markup is written inline in `app/page.tsx` — three static cards with hardcoded data — rather than modifying the reusable component. This keeps the component stable for other pages.

3. **"INTELLIGENT LEARNING" pill** is an outlined badge variant not in the current `Badge` component. It is rendered inline in the page with a simple `border border-primary-500 text-primary-500 bg-transparent` span. No new exported component needed.

4. **Hero background texture** — the design shows `neutral-50` (`#FAFAFC`) with a faint diagonal crosshatch. Implemented as an inline `style` on the hero section using a data-URI SVG pattern layered over the base color.

5. **"Explore Courses →" button** — uses the existing `Button variant="primary"` with the arrow as a literal `→` in the children. To match the slightly larger size in the design, a `text-body-lg` override and `h-14 px-8` are applied via `className`.

6. **Search bar in hero** — uses the existing `TextInput` component with `showSearchIcon` and `shortcut="⌘K"`. Wrapper gets `shadow-md rounded-xl` to match the design's larger, more prominent appearance.

7. **Course icon thumbnails** — rendered as colored squares with text abbreviations:
   - Next.js: `bg-neutral-900` + white `N`
   - Docker: `bg-[#2496ED]` (Docker brand blue) + white whale emoji `🐳`
   - TypeScript: `bg-[#3178C6]` (TS brand blue) + white `TS`
   Width/height: `w-16 h-16` (`64px`), `rounded-md`.

8. **"View all courses →" link** uses the `Button variant="text"` with a `→` in children and `className="text-primary-500"`.

9. **Decorative bottom bars** — the orange bar-chart shapes visible at the bottom of the design are rendered as three groups of absolutely-positioned colored divs with `overflow-hidden` clipping. Colors use `primary-500`, `primary-300`, `primary-200` at different heights.

10. **"New courses" row** — a centered row with an outlined star SVG icon + "New courses and lessons added every week." in `text-body text-neutral-500`.

11. **No routing needed** — `/courses` and `/my-learning` links are `<Link href="...">` elements that won't resolve yet; that is expected.

12. **Responsive** — the 3-column course grid collapses to 1 column on mobile (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`). Hero text centers at all sizes. Nav links collapse on small screens (hidden below `sm:`).

---

## Files to modify / create

| Action | File |
|---|---|
| Modify | `app/page.tsx` — full home page implementation |
| Modify | `components/nav/site-nav.tsx` — add `showUserControls` prop + bell + avatar |

No new files created.

---

## Page structure

```
<SiteNav showUserControls />

<section>  ← hero, neutral-50 + crosshatch texture, py-24 centered
  pill badge
  h1 (Playfair Display, ~56px, centered)
  subtitle (Inter, neutral-500, max-w-md, centered)
  Explore Courses → (primary button, larger)
  Search TextInput (shadow-md, rounded-xl)
</section>

<section>  ← white bg, pt-16 pb-8
  header row: "All Courses" | "View all courses →"
  3-col grid (lg), 2-col (sm), 1-col (xs) course cards (stacked layout)
</section>

<div>  ← centered "star + new courses" row, py-6
<div>  ← decorative orange bars, overflow-hidden, h-32
```

---

## Security

No user input rendered as HTML. No external image URLs. No `dangerouslySetInnerHTML`.

---

## Acceptance criteria

- [ ] `npx tsc --noEmit` — zero errors
- [ ] `npm run build` — succeeds
- [ ] Hero heading renders in Playfair Display (verify in DevTools)
- [ ] All three course cards visible with correct icon colors
- [ ] Search bar shows search icon and ⌘K shortcut
- [ ] Nav shows bell + avatar on right when `showUserControls` is true
- [ ] Page is responsive: cards stack on mobile, hero text stays centered

---

## Checks

```bash
npx tsc --noEmit
npm run build
```

## Manual test

1. `npm run dev` → `localhost:3000`
2. Confirm hero heading is Playfair Display bold, large, centered
3. Confirm search bar shadow and ⌘K badge visible
4. Resize to mobile (375px) — cards should stack, nav links visible
5. Check bell icon and avatar circle visible on the right of nav
