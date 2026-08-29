# Prompt 01 — Vertex Design System

## Goal

Implement the Vertex Design System (v1.0, May 2025) as Tailwind v4 CSS tokens and typed React component primitives. The reference is `design/vertex-designsystem.png`. Nothing beyond what is shown in that image should be built.

---

## Skills read

None of the Sanity / Clerk / agent skills apply to this task. Next.js font loading docs were read at `node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md` — the API is unchanged: `next/font/google`, CSS variable mode, injected via `className` on `<html>`.

---

## Code inspected

| File | State |
|---|---|
| `package.json` | Next 16.3.3, React 19.2.8, Tailwind v4 (`@tailwindcss/postcss`) |
| `app/globals.css` | `@import "tailwindcss"` + a small `@theme inline` block; no design tokens |
| `app/layout.tsx` | Geist Sans + Geist Mono loaded via `next/font/google`; sets CSS vars |
| `app/page.tsx` | Create Next App boilerplate; will be replaced with a blank placeholder |
| `postcss.config.mjs` | `{ "@tailwindcss/postcss": {} }` — standard Tailwind v4 setup |
| `tailwind.config.ts` | Does not exist — Tailwind v4 is configured via `@theme` in CSS only |

There are no existing components or shared utilities.

---

## Decisions and assumptions

1. **Tailwind v4 `@theme` (without `inline`)** is used for all design tokens so they are both CSS custom properties (usable in arbitrary CSS) and generate utility classes. The existing `@theme inline` block (which referenced Geist variables) is removed and replaced.

2. **Fonts** — `Inter` (weights 400, 500, 600) and `Playfair_Display` (weight 700) are loaded via `next/font/google` in CSS variable mode (`variable: '--font-inter'` / `variable: '--font-playfair'`). Both CSS vars are applied to `<html>`. The `@theme` block maps `--font-sans` → `var(--font-inter)` and `--font-display` → `var(--font-playfair)`.

3. **Color tokens** — Only the colors explicitly named in the design image are defined under `--color-primary-*` and `--color-neutral-*`. Tailwind's default color palette is kept (not reset), so `bg-blue-*` and `bg-green-*` are available for the LESSON and POPULAR badge variants, whose exact hex values are not specified in the palette section of the design.

4. **Shadow tokens** — Override Tailwind's built-in `shadow-sm / md / lg / xl` with the exact rgba values from the spec: `rgba(15, 23, 42, ...)` (neutral-900 channel). No `shadow-2xl` or other default shadows are needed.

5. **Radius tokens** — Override default `rounded-*` scale to match the spec: xs=4 px, sm=8 px, md=12 px, lg=16 px, xl=24 px, full=9999 px. Tailwind v4 maps `--radius-{name}` → `rounded-{name}`.

6. **Text size tokens** — Named text sizes from the type scale are defined as `--text-{name}` + `--text-{name}--line-height` pairs in `@theme`, yielding utilities like `text-display-1`, `text-h1`, `text-body`, etc.

7. **Components are unstyled primitives** — No animation libraries, no Radix, no external component library. Each component is a plain TypeScript function file with typed props. Tailwind classes are the only styling mechanism.

8. **No icon library is installed.** Icons shown in the design (search, chevron, play, lock, external link) are inlined as `<svg>` elements with `aria-hidden`. The spec calls for 24×24, 2 px stroke, outline style.

9. **The Vertex logo SVG** (orange V chevron) is created from path data based on the design reference. It is a standalone `<VertexLogo />` component.

10. **`app/page.tsx`** is replaced with a minimal blank placeholder — a white page with the Vertex logo centered — so the boilerplate is gone but no fake showcase page is added.

11. **`dark:` variants** are not implemented. The design system spec is light-mode only.

---

## Files to create / modify

### Modified
- `app/globals.css` — full `@theme` token block; remove Geist refs
- `app/layout.tsx` — swap Geist for Inter + Playfair Display; apply both CSS vars to `<html>`
- `app/page.tsx` — blank placeholder

### Created
```
components/
  ui/
    button.tsx        — Primary | Secondary | Tertiary | Text variants; size md (default)
    badge.tsx         — Video | Lesson | Popular variants
    input.tsx         — TextInput (with optional leading search icon) | Select
    progress.tsx      — ProgressBar (value 0–100, shows "N% complete")
    status.tsx        — StatusIndicator (inProgress | completed | nowPlaying | locked)
    card.tsx          — CourseCard | LessonVideoCard | LessonCard | ResourceCard
  nav/
    site-nav.tsx      — <SiteNav> with logo + nav links (Courses, My Learning)
    breadcrumbs.tsx   — <Breadcrumbs items={[{label, href}]} />
    pagination.tsx    — <Pagination page current total />
  logo.tsx            — <VertexLogo> SVG component
```

---

## Requirements (exact spec values)

### Colors
| Token | Hex |
|---|---|
| `--color-primary-500` | `#F97316` |
| `--color-primary-400` | `#FB923C` |
| `--color-primary-300` | `#FDBA74` |
| `--color-primary-200` | `#FED7AA` |
| `--color-primary-100` | `#FFEEE5` |
| `--color-neutral-900` | `#0F172A` |
| `--color-neutral-700` | `#334155` |
| `--color-neutral-500` | `#64748B` |
| `--color-neutral-300` | `#CBD5E1` |
| `--color-neutral-200` | `#E2E8F0` |
| `--color-neutral-100` | `#F1F5F9` |
| `--color-neutral-50`  | `#FAFAFC` |

### Type scale
| Utility | Font | Size/LH | Weight | Use |
|---|---|---|---|---|
| `text-display-1` | `font-display` | 48/56 | 700 | Page titles |
| `text-display-2` | `font-display` | 36/44 | 700 | Section titles |
| `text-h1` | `font-sans` | 28/36 | 600 | Card titles |
| `text-h2` | `font-sans` | 22/30 | 600 | Sub section |
| `text-h3` | `font-sans` | 18/26 | 500 | Small titles |
| `text-body-lg` | `font-sans` | 16/24 | 400 | Body copy |
| `text-body` | `font-sans` | 14/20 | 400 | Supporting |
| `text-small` | `font-sans` | 12/16 | 400 | Captions/meta |

### Spacing (base 4 px)
Defined as `--spacing-1` through `--spacing-16` following the 4 px grid (4, 8, 12, 16, 24, 32, 40, 48, 64 px = 1–16 in the 4 px unit system). Tailwind v4 already uses a 4 px base by default — no override needed; document only.

### Radius
`--radius-xs: 4px` | `--radius-sm: 8px` | `--radius-md: 12px` | `--radius-lg: 16px` | `--radius-xl: 24px` | `--radius-full: 9999px`

### Shadows
```
--shadow-sm: 0 1px 2px 0 rgba(15, 23, 42, 0.05);
--shadow-md: 0 4px 12px -2px rgba(15, 23, 42, 0.08);
--shadow-lg: 0 12px 24px -4px rgba(15, 23, 42, 0.10);
--shadow-xl: 0 20px 40px -8px rgba(15, 23, 42, 0.12);
```

### Buttons
- Height: 44 px; Radius: `rounded-md` (12 px); Font: Inter Medium (font-weight 500); Font size: 14–16 px; Padding: `px-4 py-0` (16 px horizontal)
- **Primary**: `bg-primary-500 text-white` → hover `bg-primary-400`; disabled `opacity-50 cursor-not-allowed`
- **Secondary**: `border border-primary-500 text-primary-500 bg-white` → hover `bg-primary-100`; disabled `opacity-50`
- **Tertiary**: `bg-white text-neutral-700 border border-neutral-200 shadow-sm` + external-link icon → hover `bg-neutral-50`; disabled `opacity-50`
- **Text**: `bg-transparent text-primary-500` + play/arrow icon → hover `underline`; disabled `opacity-50`

### Inputs
- Height: 44 px; Radius: `rounded-md` (12 px); Border: `1px solid #E2E8F0`; Padding: `px-4`; Focus: `border-primary-400 outline-none ring-0`
- `TextInput`: optional `showSearchIcon` prop that adds a search icon on the left and optional `shortcut` string (e.g. `⌘K`) on the right
- `Select`: standard `<select>` styled to match; chevron-down icon on right

### Badges
- Base: `inline-flex items-center px-2 py-0.5 rounded-full text-small font-medium uppercase tracking-wide`
- **Video**: `bg-primary-500 text-white`
- **Lesson**: `bg-blue-500 text-white`
- **Popular**: `bg-green-500 text-white`

### Progress bar
- Track: `bg-neutral-200 rounded-full h-2`; Fill: `bg-primary-500 rounded-full`; Label: `text-small text-neutral-500` showing "N% complete"

### Status indicators
- **In Progress**: clock icon + `text-neutral-500` label
- **Completed**: check-circle icon + `text-green-600` label
- **Now Playing**: orange play circle + `text-primary-500` label
- **Locked**: lock icon + `text-neutral-400` label

### Cards
All cards: `bg-white rounded-lg shadow-sm border border-neutral-200`

- **CourseCard**: 64×64 px icon block (neutral-900 bg, white letter) + title (`text-h1 font-semibold`) + description (`text-body text-neutral-500`) + footer row: level badge, duration, modules count
- **LessonVideoCard**: Video badge + title (`text-h2 font-semibold`) + description (`text-body text-neutral-500`) + footer: lesson position · duration · "Watch from MM:SS" (Text button style)
- **LessonCard**: Lesson badge + title (`text-h2 font-semibold`) + description + footer: module · lesson · "View lesson" (Tertiary button style, external link icon)
- **ResourceCard**: file icon left + title + description + file meta (type · size) + external link icon right

### Navigation
- **SiteNav**: `bg-white border-b border-neutral-200 h-16`; Logo left; links right: `text-body-lg font-medium text-neutral-700` active `text-primary-500`
- **Breadcrumbs**: items separated by `›` chevron; last item non-link `text-neutral-900`; others `text-neutral-500 hover:text-neutral-700`
- **Pagination**: prev/next chevron buttons + numbered page buttons; current page `bg-primary-500 text-white rounded-md`; ellipsis `…` for gaps

---

## Security considerations

No user input is rendered as HTML. All component props are typed; no `dangerouslySetInnerHTML`. No external requests. Fonts self-hosted via `next/font`.

---

## Acceptance criteria

- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] `npm run build` succeeds
- [ ] All design tokens (colors, type scale, radius, shadows) are visible in `globals.css`
- [ ] `Inter` and `Playfair Display` load correctly in the browser (verified via DevTools → Network → Fonts)
- [ ] Each component renders in its variants without console errors
- [ ] Buttons show correct hover and disabled states
- [ ] Cards render representative dummy props without layout overflow

---

## Checks to run after implementation

```bash
npx tsc --noEmit
npm run lint
npm run build
```

---

## Manual test steps

1. `npm run dev` → open `localhost:3000`
2. Confirm Inter font loads (no fallback flash), Playfair Display loaded
3. Open DevTools → Elements → inspect `<html>` → confirm both `--font-inter` and `--font-playfair` CSS vars are set
4. Open DevTools → Elements → inspect `:root` → confirm `--color-primary-500: #F97316` and other tokens appear
5. Confirm page background is white (`#FFFFFF`), no dark mode override
6. No TypeScript errors in the editor
