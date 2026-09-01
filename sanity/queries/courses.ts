import {defineQuery} from 'next-sanity'

/**
 * Card fields only — no learning outcomes, no module bodies. Totals are summed
 * from lesson durations rather than stored, so a course can never disagree with
 * its own lessons.
 */
export const COURSES_CATALOG_QUERY = defineQuery(`
  *[_type == "course" && defined(slug.current)] | order(popular desc, title asc) {
    _id,
    title,
    "slug": slug.current,
    summary,
    coverImage,
    level,
    price,
    popular,
    studentCount,
    instructor->{
      _id,
      name,
      "slug": slug.current,
      photo
    },
    category->{
      _id,
      title,
      "slug": slug.current
    },
    "moduleCount": count(modules),
    "lessonCount": count(modules[].lessons[]),
    "durationSeconds": math::sum(modules[].lessons[]->durationSeconds)
  }
`)

export const COURSE_SLUGS_QUERY = defineQuery(`
  *[_type == "course" && defined(slug.current)].slug.current
`)

export const COURSE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "course" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    summary,
    coverImage,
    level,
    price,
    popular,
    studentCount,
    learningOutcomes[] {
      _key,
      icon,
      title,
      description
    },
    instructor->{
      _id,
      name,
      "slug": slug.current,
      photo,
      expertise
    },
    category->{
      _id,
      title,
      "slug": slug.current
    },
    modules[] {
      _key,
      title,
      summary,
      "durationSeconds": math::sum(lessons[]->durationSeconds),
      lessons[]-> {
        _id,
        title,
        "slug": slug.current,
        summary,
        durationSeconds,
        freePreview,
        thumbnail
      }
    },
    "moduleCount": count(modules),
    "lessonCount": count(modules[].lessons[]),
    "durationSeconds": math::sum(modules[].lessons[]->durationSeconds)
  }
`)
