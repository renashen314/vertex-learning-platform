# 04 — Seed the Sanity dataset from the provided files

## Goal

Load the provided seed content into the Sanity `production` dataset with the
Sanity CLI importer. Do not generate content and do not edit
`studio/scripts/seed/seed.ndjson` or `studio/scripts/seed/videos.json`. Adapt
the lesson schema and the web read layer to the field names the seed actually
uses, then import and verify document counts.

## Skills read

- `AGENTS.md` sections 5, 8, 9, 12, 13 (workspace split, content model, video
  ingestion, dataset is private, checks to run).
- `sanity-best-practices` for the schema edit and GROQ projections.

## Code and config inspected

- `studio/sanity.cli.ts`, `studio/sanity.config.ts` — workspace `vertex`,
  project `oc30tnor`, dataset `production`.
- `studio/schemaTypes/**` — `course`, `lesson`, `instructor`, `category`
  documents; `module`, `learningOutcome`, `lessonResource` objects. There is no
  `video` document type.
- `sanity/queries/{courses,lessons,instructors,categories}.ts` — the read layer.
- `npx sanity debug` — CLI authenticated as an `administrator` on the project.
- Dataset today holds 12 documents, all `system.*`. No content, so this is a
  first load, not an overwrite.

## What the seed files actually contain

### `seed.ndjson` — 141 documents, validated locally

| Type | Count |
| --- | --- |
| `lesson` | 120 |
| `course` | 10 |
| `category` | 6 |
| `instructor` | 5 |

- 141 unique `_id`s, no duplicates.
- 140 references, zero dangling.
- 120 unique YouTube `videoUrl` values, one per lesson.
- 135 images use the importer's `_sanityAsset: "image@<url>"` form, so the
  import uploads them from `i.ytimg.com` (120), `picsum.photos` (10), and
  `randomuser.me` (5). The import needs network access to those hosts.

### `videos.json` — a 120-entry manifest, not importable documents

A JSON object keyed by lesson slug, each entry
`{id, title, channel, duration, query}`. Cross-checked against the seed:

- 120 entries, exactly one per lesson slug, no extras and none missing.
- Every `id` matches the YouTube id already in that lesson's `videoUrl`.
- Every `duration` matches that lesson's `duration`.

So its content is already carried by `seed.ndjson`; there is nothing separate to
import from it. It is also not importable as-is: it is a keyed map rather than
NDJSON, carries no `_id`/`_type`, and there is no `video` document type to
receive it.

Critically, it holds **no `chapters` and no `chunks`**. The video documents of
AGENTS.md section 8 cannot be built from it, and section 9 says those are built
by offline ingestion tooling. Fabricating chapters or transcript chunks would
violate the grounding rule, so this pass does not create `video` documents. The
manifest's YouTube ids are the input the ingestion pipeline will fetch captions
and chapter markers for — that is separate work.

## The lesson field mismatch, and the fix

Every one of the 120 seeded lessons carries `duration` (integer seconds) where
the schema declares `durationSeconds`, and carries no `summary` where the schema
marks it required. The seed files are not to be modified, so the schema moves to
match the data. Decided with the user.

`sanity dataset import` does not validate against the schema, so an unadapted
import would still succeed — but all 120 lessons would show validation errors in
the Studio and every read of `durationSeconds` would come back `undefined`.

Nothing in `app/` or `components/` reads `durationSeconds` yet, so a full rename
is safe and leaves one name rather than a field aliased to a different one.

## Plan

1. `studio/schemaTypes/documents/lesson.ts`
   - Rename field `durationSeconds` to `duration`. Keep the title
     "Duration (seconds)", the description, and the
     `required().integer().min(1)` validation, so units stay explicit.
   - Update the `preview.select` and `prepare` to read `duration`.
   - Drop `.required()` from `summary`, keeping `max(240)`. The seed has no
     lesson summaries; authors may still add one.
2. Update the read layer to project `duration`:
   - `sanity/queries/lessons.ts` — the raw lesson field and the sibling-lesson
     projection inside `course.modules[]`.
   - `sanity/queries/courses.ts` — three synthetic sums plus the raw field in
     the module lesson projection.
   - `sanity/queries/instructors.ts` — one synthetic sum.
   - Synthetic totals are renamed `durationSeconds` -> `duration` too, so the
     read layer uses one name throughout.
3. Regenerate types: `cd studio && npm run typegen` (writes `../sanity.types.ts`).
4. Import: `cd studio && npx sanity dataset import scripts/seed/seed.ndjson production`
   (no `--replace`; the dataset holds no content documents).
5. Verify with GROQ, not by trusting the importer's summary:
   - total non-draft, non-system count == 141
   - per-type counts == the table above
   - `count(*[_type == "course" && !defined(instructor->)])` == 0
   - `count(*[_type == "lesson" && !defined(thumbnail.asset->url)])` == 0
   - `count(*[_type == "lesson" && !defined(duration)])` == 0
6. Report the real numbers.

## Files expected to change

- `studio/schemaTypes/documents/lesson.ts`
- `sanity/queries/lessons.ts`
- `sanity/queries/courses.ts`
- `sanity/queries/instructors.ts`
- `sanity.types.ts` (generated)
- `prompts/04-seed-import.md`

`seed.ndjson` and `videos.json` are not touched.

## Security

- The import runs from the `studio` workspace with the CLI's own session token.
  No token is written to a file, echoed, or committed.
- The dataset stays private. Nothing here exposes a token to the browser.

## Acceptance criteria

- 141 content documents in `production`, matching the per-type table.
- Every course resolves its instructor and category.
- Every lesson thumbnail resolves to an uploaded asset.
- Every lesson has a `duration` and no Studio validation errors.
- `seed.ndjson` and `videos.json` are byte-identical to how they arrived
  (checksums recorded before and after).

## Checks

- `cd studio && npm run typegen` succeeds.
- Web: `npx tsc --noEmit` and `npm run lint`.
- No build: no routes, config, or server modules change — only GROQ strings and
  generated types. Note if that stops being true.
- `sanity dataset import` exits 0.
- The five GROQ verification queries above.

## Manual test steps

1. `cd studio && npx sanity dev`, open the Studio.
2. Courses list shows 10 courses with cover images.
3. Open a course, confirm modules list lessons in order and the instructor
   resolves.
4. Open a lesson, confirm the thumbnail renders, notes are Portable Text, and
   the preview subtitle shows a duration with no validation errors.

## Needs a decision later, not in this pass

Video documents (chapters and transcript chunks) remain unseeded. Search's
video-moment results depend on them and on the ingestion pipeline in section 9.
