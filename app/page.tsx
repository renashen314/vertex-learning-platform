import Link from "next/link";
import { CourseCard } from "@/components/course/course-card";
import { SiteNav } from "@/components/nav/site-nav";
import { IconSearch, IconStar } from "@/components/ui/icons";
import { DecorativeBars, hatchedBackground } from "@/components/ui/page-chrome";
import { sanityFetch } from "@/sanity/lib/fetch";
import { COURSES_CATALOG_QUERY } from "@/sanity/queries/courses";

/**
 * The design shows three cards above "View all courses". The catalog query is
 * shared with the catalog page and stays uncapped, so the slice happens here —
 * ten card-sized records is a trivial payload. The query's `popular desc, title
 * asc` ordering already puts the right three first.
 */
const FEATURED_COURSE_COUNT = 3;

export default async function Home() {
  const courses = await sanityFetch({
    query: COURSES_CATALOG_QUERY,
    tags: ["course", "lesson"],
  });
  const featured = courses.slice(0, FEATURED_COURSE_COUNT);

  return (
    <div className="flex flex-col min-h-screen">
      <SiteNav showUserControls />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={hatchedBackground} className="py-20 px-6 sm:py-28">
        <div className="max-w-2xl mx-auto flex flex-col items-center text-center gap-7">

          {/* "INTELLIGENT LEARNING" pill */}
          <span className="inline-flex items-center border border-primary-500 text-primary-500 text-small font-medium uppercase tracking-widest px-4 py-1.5 rounded-full">
            Intelligent Learning
          </span>

          {/* Heading */}
          <h1 className="font-display text-[3rem] sm:text-[3.5rem] leading-[1.1] font-bold text-neutral-900">
            Search your learning<br />in plain English.
          </h1>

          {/* Subtitle */}
          <p className="text-body-lg text-neutral-500 max-w-sm leading-relaxed">
            Vertex understands what you want to learn and finds the exact
            lessons across all your courses.
          </p>

          {/* CTA */}
          <Link
            href="/courses"
            className="inline-flex items-center gap-2.5 bg-primary-500 text-white font-medium text-body-lg rounded-md px-8 h-14 hover:bg-primary-400 transition-colors"
          >
            Explore Courses
            <span aria-hidden="true" className="text-lg">→</span>
          </Link>

          {/* Search bar */}
          <div className="w-full max-w-xl bg-white rounded-xl shadow-md border border-neutral-200 flex items-center h-16 px-5 gap-3">
            <IconSearch size={20} className="flex-shrink-0 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Ask anything about your learning..."
              className="flex-1 text-body-lg text-neutral-900 placeholder:text-neutral-400 outline-none bg-transparent"
              readOnly
            />
            <span className="flex-shrink-0 text-small text-neutral-500 border border-neutral-200 bg-neutral-50 rounded px-2 py-1 font-mono">
              ⌘K
            </span>
          </div>
        </div>
      </section>

      {/* ── All Courses ──────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-10">

          {/* Section header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-h1 font-semibold text-neutral-900">
              All Courses
            </h2>
            <Link
              href="/courses"
              className="text-body font-medium text-primary-500 hover:underline inline-flex items-center gap-1"
            >
              View all courses <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Course cards — stacked icon layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        </div>

        {/* "New courses" row */}
        <div className="flex items-center justify-center gap-2 py-6 text-body text-neutral-500">
          <IconStar size={18} className="text-primary-400" />
          New courses and lessons added every week.
        </div>
      </section>

      {/* ── Decorative bars ──────────────────────────────────── */}
      <DecorativeBars
        className="bg-white"
        height={160}
        bars={[
          { left: "4%", width: "13%", height: 110, color: "#F97316" },
          { left: "18%", width: "13%", height: 76, color: "#FDBA74" },
          { left: "55%", width: "13%", height: 88, color: "#FED7AA" },
          { left: "70%", width: "13%", height: 128, color: "#FB923C" },
          { left: "84%", width: "13%", height: 64, color: "#F97316" },
        ]}
      />
    </div>
  );
}
