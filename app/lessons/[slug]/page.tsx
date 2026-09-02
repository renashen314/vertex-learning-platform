import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { LessonFooterNav } from "@/components/lesson/lesson-footer-nav";
import { LessonHeader } from "@/components/lesson/lesson-header";
import { LessonSidebarShell } from "@/components/lesson/lesson-sidebar-shell";
import { LessonTabs } from "@/components/lesson/lesson-tabs";
import { LessonVideo } from "@/components/lesson/lesson-video";
import { Breadcrumbs } from "@/components/nav/breadcrumbs";
import { SiteNav } from "@/components/nav/site-nav";
import { parseStartSeconds } from "@/lib/youtube";
import { deriveLessonPosition } from "@/sanity/lib/lesson-position";
import { sanityFetch } from "@/sanity/lib/fetch";
import { LESSON_BY_SLUG_QUERY, LESSON_SLUGS_QUERY } from "@/sanity/queries/lessons";

import type { Lesson, LessonCourseModuleLesson } from "@/components/lesson/types";

export async function generateStaticParams() {
  const slugs = await sanityFetch({
    query: LESSON_SLUGS_QUERY,
    tags: ["lesson"],
  });

  return slugs
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => ({ slug }));
}

async function getLesson(slug: string) {
  return sanityFetch({
    query: LESSON_BY_SLUG_QUERY,
    params: { slug },
    tags: ["lesson", "course"],
  });
}

export async function generateMetadata(
  props: PageProps<"/lessons/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const lesson = await getLesson(slug);

  if (!lesson) return { title: "Lesson not found | Vertex" };

  const title = lesson.course?.title
    ? `${lesson.title} | ${lesson.course.title} | Vertex`
    : `${lesson.title} | Vertex`;

  return { title, description: lesson.summary ?? undefined };
}

export default async function LessonPage(props: PageProps<"/lessons/[slug]">) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const lesson = await getLesson(slug);

  if (!lesson || !lesson.course) notFound();

  const course = lesson.course;
  const modules = course.modules ?? [];
  const position = deriveLessonPosition(
    modules.map((courseModule) => ({
      _key: courseModule._key,
      title: courseModule.title,
      lessonIds: courseModule.lessonIds,
    })),
    lesson._id,
  );

  if (!position) notFound();

  const lessonsById = buildLessonLookup(modules);
  const previous = position.previousLessonId
    ? lessonsById.get(position.previousLessonId) ?? null
    : null;
  const next = position.nextLessonId
    ? lessonsById.get(position.nextLessonId) ?? null
    : null;

  const startSeconds = parseStartSeconds(searchParams.t) ?? undefined;
  const title = lesson.title ?? "Untitled lesson";
  const courseTitle = course.title ?? "Untitled course";

  return (
    <div className="flex flex-col min-h-screen bg-neutral-50">
      <SiteNav showUserControls />

      <div className="flex-1 flex flex-col lg:flex-row">
        <LessonSidebarShell
          courseSlug={course.slug ?? ""}
          courseTitle={courseTitle}
          courseCoverImage={course.coverImage}
          modules={modules.map((courseModule) => ({
            key: courseModule._key,
            title: courseModule.title ?? "Untitled module",
            lessons: courseModule.lessons ?? [],
          }))}
          currentModuleKey={position.moduleKey}
          currentLessonId={lesson._id}
        />

        <main className="flex-1 min-w-0">
          <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col gap-8">
            <Breadcrumbs
              items={[
                { label: "All Courses", href: "/courses" },
                { label: courseTitle, href: `/courses/${course.slug}` },
                { label: position.moduleTitle ?? "Module" },
                { label: title },
              ]}
            />

            <LessonHeader
              lessonSlug={slug}
              lessonLabel={position.lessonLabel}
              title={title}
              summary={lesson.summary}
              level={course.level}
              duration={lesson.duration}
              studentCount={lesson.studentCount}
            />

            <LessonVideo videoUrl={lesson.videoUrl} title={title} startSeconds={startSeconds} />

            <LessonTabs
              notes={lesson.notes}
              keyPoints={lesson.keyPoints}
              proTip={lesson.proTip}
              resources={lesson.resources}
            />
          </div>
        </main>
      </div>

      <LessonFooterNav
        courseSlug={course.slug ?? ""}
        previous={previous}
        next={next}
      />
    </div>
  );
}

/** Flattens every module's resolved lessons into a single id -> display-fields lookup. */
function buildLessonLookup(
  modules: NonNullable<Lesson["course"]>["modules"],
): Map<string, { slug: string; title: string; duration: number | null }> {
  const map = new Map<string, { slug: string; title: string; duration: number | null }>();

  for (const courseModule of modules ?? []) {
    for (const lesson of courseModule.lessons ?? []) {
      addLesson(map, lesson);
    }
  }

  return map;
}

function addLesson(
  map: Map<string, { slug: string; title: string; duration: number | null }>,
  lesson: LessonCourseModuleLesson,
) {
  if (!lesson.slug) return;
  map.set(lesson._id, {
    slug: lesson.slug,
    title: lesson.title ?? "Untitled lesson",
    duration: lesson.duration,
  });
}
