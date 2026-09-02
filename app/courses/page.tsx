import type { Metadata } from "next";
import Link from "next/link";

import { CourseCard } from "@/components/course/course-card";
import { SiteNav } from "@/components/nav/site-nav";
import { hatchedBackground } from "@/components/ui/page-chrome";
import { sanityFetch } from "@/sanity/lib/fetch";
import { COURSES_CATALOG_QUERY } from "@/sanity/queries/courses";

export const metadata: Metadata = {
  title: "All Courses | Vertex",
  description: "Every course on Vertex.",
};

export default async function CoursesPage() {
  const courses = await sanityFetch({
    query: COURSES_CATALOG_QUERY,
    tags: ["course", "lesson"],
  });

  return (
    <div className="flex flex-col min-h-screen" style={hatchedBackground}>
      <SiteNav showUserControls />

      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-8">
          <h1 className="text-h1 font-semibold text-neutral-900">All Courses</h1>
          <p className="text-body text-neutral-500">
            {courses.length} {courses.length === 1 ? "course" : "courses"}
          </p>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : (
          <div className="bg-white/60 border border-neutral-200 rounded-lg p-10 text-center flex flex-col gap-3">
            <p className="text-body-lg text-neutral-900">No courses yet.</p>
            <p className="text-body text-neutral-500">
              Once courses are published they will appear here.{" "}
              <Link href="/" className="text-primary-500 hover:underline">
                Back home
              </Link>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
