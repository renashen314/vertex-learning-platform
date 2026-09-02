import {defineQuery} from 'next-sanity'

export const INSTRUCTOR_SLUGS_QUERY = defineQuery(`
  *[_type == "instructor" && defined(slug.current)].slug.current
`)

export const INSTRUCTORS_QUERY = defineQuery(`
  *[_type == "instructor" && defined(slug.current)] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    photo,
    expertise,
    "courseCount": count(*[_type == "course" && references(^._id)])
  }
`)

export const INSTRUCTOR_BY_SLUG_QUERY = defineQuery(`
  *[_type == "instructor" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    photo,
    expertise,
    bio,
    "courses": *[_type == "course" && references(^._id)] | order(popular desc, title asc) {
      _id,
      title,
      "slug": slug.current,
      summary,
      coverImage,
      level,
      popular,
      studentCount,
      "lessonCount": count(modules[].lessons[]),
      "duration": math::sum(modules[].lessons[]->duration)
    }
  }
`)
