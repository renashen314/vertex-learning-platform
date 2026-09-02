/**
 * "Module 5 of 12" and "Lesson 5.1" are derived from array order, never stored
 * (see AGENTS.md §8). This module is the single place that derivation happens.
 *
 * Pure and dependency-free, so it is safe to import from server or client
 * components.
 */

export type ModuleLessonOrder = {
  _key: string
  title: string | null
  /** Lesson document ids, in authored order. */
  lessonIds: Array<string> | null
}

export type LessonPosition = {
  /** 1-based index of the module inside the course. */
  moduleNumber: number
  /** 1-based index of the lesson inside its module. */
  lessonNumber: number
  moduleKey: string
  moduleTitle: string | null
  /** e.g. "Module 5 of 12" */
  moduleLabel: string
  /** e.g. "Lesson 5.1" */
  lessonLabel: string
  /** Lesson id immediately before this one, across module boundaries. */
  previousLessonId: string | null
  /** Lesson id immediately after this one, across module boundaries. */
  nextLessonId: string | null
}

/**
 * Locates a lesson inside a course's module list.
 *
 * Returns `null` when the lesson is not listed by any module — which happens
 * legitimately for a lesson that exists but has not been added to a course yet.
 * Callers should treat that as "no position", not as an error.
 */
export function deriveLessonPosition(
  modules: ReadonlyArray<ModuleLessonOrder> | null | undefined,
  lessonId: string,
): LessonPosition | null {
  if (!modules?.length) return null

  // Flattened order is what previous/next walk, so a lesson at the end of one
  // module links to the first lesson of the next.
  const flattened: Array<string> = []
  for (const courseModule of modules) {
    for (const id of courseModule.lessonIds ?? []) {
      flattened.push(id)
    }
  }

  for (const [moduleIndex, courseModule] of modules.entries()) {
    const lessonIds = courseModule.lessonIds ?? []
    const lessonIndex = lessonIds.indexOf(lessonId)
    if (lessonIndex === -1) continue

    const flatIndex = flattened.indexOf(lessonId)

    return {
      moduleNumber: moduleIndex + 1,
      lessonNumber: lessonIndex + 1,
      moduleKey: courseModule._key,
      moduleTitle: courseModule.title,
      moduleLabel: `Module ${moduleIndex + 1} of ${modules.length}`,
      lessonLabel: `Lesson ${moduleIndex + 1}.${lessonIndex + 1}`,
      previousLessonId: flatIndex > 0 ? flattened[flatIndex - 1] : null,
      nextLessonId: flatIndex < flattened.length - 1 ? flattened[flatIndex + 1] : null,
    }
  }

  return null
}
