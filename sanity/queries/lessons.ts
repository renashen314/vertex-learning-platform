import {defineQuery} from 'next-sanity'

export const LESSON_SLUGS_QUERY = defineQuery(`
  *[_type == "lesson" && defined(slug.current)].slug.current
`)

/**
 * The lesson plus the course that lists it, derived with a reverse reference
 * because a lesson never stores its parent.
 *
 * `course.modules[].lessonIds` is the raw reference list in authored order —
 * that is what `deriveLessonPosition` turns into "Module 5 of 12",
 * "Lesson 5.1", and the previous/next links. `level` also comes from the
 * course; it is not duplicated onto the lesson.
 */
export const LESSON_BY_SLUG_QUERY = defineQuery(`
  *[_type == "lesson" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    summary,
    videoUrl,
    thumbnail,
    duration,
    freePreview,
    studentCount,
    keyPoints,
    notes,
    proTip,
    resources[] {
      _key,
      type,
      title,
      description,
      url
    },
    "course": *[_type == "course" && references(^._id)][0] {
      _id,
      title,
      "slug": slug.current,
      level,
      coverImage,
      instructor->{
        _id,
        name,
        "slug": slug.current,
        photo
      },
      modules[] {
        _key,
        title,
        "lessonIds": lessons[]._ref,
        lessons[]-> {
          _id,
          title,
          "slug": slug.current,
          duration
        }
      }
    }
  }
`)
