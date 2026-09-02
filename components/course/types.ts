import type { COURSE_BY_SLUG_QUERY_RESULT } from "@/sanity.types";

/**
 * The course page's props are slices of the generated query result, so a GROQ
 * projection change surfaces here as a type error rather than as a blank
 * section at runtime.
 */
export type Course = NonNullable<COURSE_BY_SLUG_QUERY_RESULT>;

export type CourseCoverImage = NonNullable<Course["coverImage"]>;

export type CourseModule = NonNullable<Course["modules"]>[number];

export type CourseModuleLesson = NonNullable<CourseModule["lessons"]>[number];

export type CourseLearningOutcome = NonNullable<
  Course["learningOutcomes"]
>[number];
