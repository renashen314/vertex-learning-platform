import {defineQuery} from 'next-sanity'

/**
 * Hydrates lesson slugs the search agent matched, in one round trip.
 *
 * The agent (see `lib/search/system-prompt.ts`) is only ever asked for a
 * lesson slug plus a short match description — never a title, course, image,
 * or timestamp. This query is the single source of truth for everything
 * else a result card needs, so nothing the model writes reaches the client
 * unverified. Mirrors `LESSON_BY_SLUG_QUERY`'s reverse-reference course
 * lookup, but for many slugs at once.
 */
export const SEARCH_HYDRATE_QUERY = defineQuery(`
  *[_type == "lesson" && slug.current in $slugs] {
    _id,
    title,
    "slug": slug.current,
    thumbnail,
    duration,
    keyPoints,
    "course": *[_type == "course" && references(^._id)][0] {
      title,
      "slug": slug.current,
      coverImage,
      modules[] {
        _key,
        title,
        "lessonIds": lessons[]._ref
      }
    }
  }
`)
