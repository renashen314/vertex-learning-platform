import Link from "next/link";
import { SiteNav } from "@/components/nav/site-nav";

/* ── Hero background: neutral-50 + subtle crosshatch texture ─── */
const heroStyle: React.CSSProperties = {
  backgroundColor: "#FAFAFC",
  backgroundImage: [
    "repeating-linear-gradient(45deg, rgba(15,23,42,0.03) 0, rgba(15,23,42,0.03) 1px, transparent 0, transparent 50%)",
    "repeating-linear-gradient(-45deg, rgba(15,23,42,0.03) 0, rgba(15,23,42,0.03) 1px, transparent 0, transparent 50%)",
  ].join(", "),
  backgroundSize: "24px 24px",
};

/* ── Static course data ─────────────────────────────────────── */
const courses = [
  {
    id: "nextjs",
    title: "Next.js for Production",
    description:
      "Build scalable, high-performance web applications with Next.js.",
    level: "Intermediate",
    duration: "18h 24m",
    modules: 12,
  },
  {
    id: "docker",
    title: "Docker Essentials",
    description:
      "Containerize applications and streamline your development workflow.",
    level: "Beginner",
    duration: "10h 12m",
    modules: 8,
  },
  {
    id: "typescript",
    title: "TypeScript Deep Dive",
    description:
      "Go beyond the basics and write safer, more expressive code.",
    level: "Intermediate",
    duration: "14h 36m",
    modules: 10,
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteNav showUserControls />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section style={heroStyle} className="py-20 px-6 sm:py-28">
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
            <SearchIcon />
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
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 flex flex-col gap-5"
              >
                {/* Icon */}
                <CourseIcon id={course.id} />

                {/* Content */}
                <div className="flex flex-col gap-2 flex-1">
                  <h3 className="text-h2 font-semibold text-neutral-900">
                    {course.title}
                  </h3>
                  <p className="text-body text-neutral-500 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 text-small text-neutral-500 border-t border-neutral-100 pt-4">
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <BarChartIcon />
                    {course.level}
                  </span>
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <ClockIcon />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <GridIcon />
                    {course.modules} modules
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* "New courses" row */}
        <div className="flex items-center justify-center gap-2 py-6 text-body text-neutral-500">
          <StarIcon />
          New courses and lessons added every week.
        </div>
      </section>

      {/* ── Decorative bars ──────────────────────────────────── */}
      <div className="relative overflow-hidden bg-white" style={{ height: 160 }}>
        {/* Left group */}
        <Bar bottom={0} left="4%"  width="13%" height={110} color="#F97316" />
        <Bar bottom={0} left="18%" width="13%" height={76}  color="#FDBA74" />

        {/* Right group */}
        <Bar bottom={0} left="55%" width="13%" height={88}  color="#FED7AA" />
        <Bar bottom={0} left="70%" width="13%" height={128} color="#FB923C" />
        <Bar bottom={0} left="84%" width="13%" height={64}  color="#F97316" />
      </div>
    </div>
  );
}

/* ── Course icon per course id ──────────────────────────────── */

function CourseIcon({ id }: { id: string }) {
  if (id === "nextjs") {
    return (
      <div className="w-16 h-16 rounded-md bg-neutral-900 flex items-center justify-center">
        <span className="text-[1.75rem] font-bold text-white leading-none">
          N
        </span>
      </div>
    );
  }
  if (id === "docker") {
    return (
      <div className="w-16 h-16 rounded-md bg-white border border-neutral-200 flex items-center justify-center text-[2rem] leading-none select-none">
        🐳
      </div>
    );
  }
  /* TypeScript */
  return (
    <div className="w-16 h-16 rounded-md flex items-center justify-center" style={{ backgroundColor: "#3178C6" }}>
      <span className="text-[1.125rem] font-bold text-white tracking-tight">
        TS
      </span>
    </div>
  );
}

/* ── Decorative bar helper ──────────────────────────────────── */

function Bar({
  bottom,
  left,
  width,
  height,
  color,
}: {
  bottom: number;
  left: string;
  width: string;
  height: number;
  color: string;
}) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        bottom,
        left,
        width,
        height,
        backgroundColor: color,
        borderRadius: "6px 6px 0 0",
      }}
    />
  );
}

/* ── SVG icons (inline, no external dependency) ─────────────── */

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="flex-shrink-0">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BarChartIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FB923C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
