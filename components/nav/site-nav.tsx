import Link from "next/link";
import { VertexLogo } from "@/components/logo";

export interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

export interface SiteNavProps {
  links?: NavLink[];
}

const defaultLinks: NavLink[] = [
  { label: "Courses", href: "/courses" },
  { label: "My Learning", href: "/my-learning" },
];

export function SiteNav({ links = defaultLinks }: SiteNavProps) {
  return (
    <nav className="bg-white border-b border-neutral-200 h-16 flex items-center px-6">
      <div className="flex-1 flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <VertexLogo size={28} />
          <span className="text-h3 font-semibold text-neutral-900 tracking-tight">
            Vertex
          </span>
        </Link>
        <ul className="flex items-center gap-6 list-none m-0 p-0">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={[
                  "text-body-lg font-medium transition-colors",
                  link.active
                    ? "text-primary-500"
                    : "text-neutral-700 hover:text-neutral-900",
                ].join(" ")}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
