import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseContent, type ContentModule } from "@/components/course/course-content";
import { CourseHero } from "@/components/course/course-hero";
import { CourseOutcomes } from "@/components/course/course-outcomes";
import { CourseProgressBar } from "@/components/course/course-progress-bar";
import { Breadcrumbs } from "@/components/nav/breadcrumbs";
import { SiteNav } from "@/components/nav/site-nav";
import { DecorativeBars, hatchedBackground } from "@/components/ui/page-chrome";
import { sanityFetch } from "@/sanity/lib/fetch";
import { COURSE_BY_SLUG_QUERY, COURSE_SLUGS_QUERY } from "@/sanity/queries/courses";

import type { Course } from "@/components/course/types";

/**
 * Learner progress has no data model yet (AGENTS.md §7 puts it behind a server
 * route that this phase does not build), so the page reports what it actually
 * knows: nothing completed.
 */
const PERCENT_COMPLETE = 0;

export async function generateStaticParams() {
  const slugs = await sanityFetch({
    query: COURSE_SLUGS_QUERY,
    tags: ["course"],
  });

  return slugs
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => ({ slug }));
}

async function getCourse(slug: string) {
  return sanityFetch({
    query: COURSE_BY_SLUG_QUERY,
    params: { slug },
    tags: ["course", "lesson"],
  });
}

export async function generateMetadata(
  props: PageProps<"/courses/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const course = await getCourse(slug);

  if (!course) return { title: "Course not found | Vertex" };

  return {
    title: `${course.title} | Vertex`,
    description: course.summary ?? undefined,
  };
}

export default async function CoursePage(props: PageProps<"/courses/[slug]">) {
  const { slug } = await props.params;
  const course = await getCourse(slug);

  if (!course) notFound();

  const modules = toContentModules(course);
  const firstLessonSlug = modules[0]?.lessons[0]?.slug ?? null;
  const ctaLabel = PERCENT_COMPLETE > 0 ? "Continue Learning" : "Start Learning";
  const title = course.title ?? "Untitled course";

  return (
    <div className="flex flex-col min-h-screen" style={hatchedBackground}>
      <SiteNav showUserControls />

      {/* Bottom padding clears the fixed progress bar. */}
      <main className="flex-1 w-full max-w-[928px] mx-auto px-6 pt-8 pb-44 sm:pb-32 flex flex-col gap-10">
        <Breadcrumbs
          items={[
            { label: "All Courses", href: "/courses" },
            { label: title },
          ]}
        />

        <CourseHero
          title={title}
          summary={course.summary}
          coverImage={course.coverImage}
          popular={course.popular}
          level={course.level}
          duration={course.duration}
          moduleCount={course.moduleCount}
          studentCount={course.studentCount}
          firstLessonSlug={firstLessonSlug}
          ctaLabel={ctaLabel}
        />

        <CourseOutcomes outcomes={course.learningOutcomes ?? []} />

        <CourseContent modules={modules} duration={course.duration} />
      </main>

      <DecorativeBars
        height={140}
        bars={[
          { left: "2%", width: "12%", height: 96, color: "#FFEEE5" },
          { left: "15%", width: "12%", height: 64, color: "#FED7AA" },
          { left: "72%", width: "12%", height: 76, color: "#FED7AA" },
          { left: "86%", width: "12%", height: 110, color: "#FFEEE5" },
        ]}
      />

      <CourseProgressBar
        percentComplete={PERCENT_COMPLETE}
        firstLessonSlug={firstLessonSlug}
        ctaLabel={ctaLabel}
      />
    </div>
  );
}

/**
 * Narrows the query result to the plain, serialisable shape the client-side
 * accordion accepts. Modules and lessons with no title are dropped rather than
 * rendered as blanks.
 */
function toContentModules(course: Course): ContentModule[] {
  return (course.modules ?? []).map((courseModule) => ({
    key: courseModule._key,
    title: courseModule.title ?? "Untitled module",
    summary: courseModule.summary,
    duration: courseModule.duration,
    lessons: (courseModule.lessons ?? []).map((lesson) => ({
      id: lesson._id,
      title: lesson.title ?? "Untitled lesson",
      slug: lesson.slug,
      duration: lesson.duration,
      freePreview: Boolean(lesson.freePreview),
    })),
  }));
}
