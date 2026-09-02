import type { LESSON_BY_SLUG_QUERY_RESULT } from "@/sanity.types";

/**
 * The lesson page's props are slices of the generated query result, so a GROQ
 * projection change surfaces here as a type error rather than as a blank
 * section at runtime.
 */
export type Lesson = NonNullable<LESSON_BY_SLUG_QUERY_RESULT>;

export type LessonCourse = NonNullable<Lesson["course"]>;

export type LessonCourseCoverImage = NonNullable<LessonCourse["coverImage"]>;

export type LessonCourseModule = NonNullable<LessonCourse["modules"]>[number];

export type LessonCourseModuleLesson = NonNullable<
  LessonCourseModule["lessons"]
>[number];

export type LessonResource = NonNullable<Lesson["resources"]>[number];

export type LessonNotes = NonNullable<Lesson["notes"]>;
