import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 list-none m-0 p-0 flex-wrap">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              {isLast || !item.href ? (
                <span
                  className={[
                    "text-body",
                    isLast
                      ? "text-neutral-900 font-medium"
                      : "text-neutral-500",
                  ].join(" ")}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-body text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  {item.label}
                </Link>
              )}
              {!isLast && (
                <span className="text-body text-neutral-300" aria-hidden="true">
                  ›
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
