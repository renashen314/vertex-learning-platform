import type { Metadata } from "next";

import { SearchBar } from "@/components/search/search-bar";
import { SearchResults } from "@/components/search/search-results";
import { SiteNav } from "@/components/nav/site-nav";
import { Badge } from "@/components/ui/badge";
import { hatchedBackground } from "@/components/ui/page-chrome";

export async function generateMetadata(
  props: PageProps<"/search">,
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const query = firstValue(searchParams.q);

  return {
    title: query ? `Results for “${query}” | Vertex` : "Search | Vertex",
  };
}

export default async function SearchPage(props: PageProps<"/search">) {
  const searchParams = await props.searchParams;
  const query = firstValue(searchParams.q) ?? "";

  return (
    <div className="flex flex-col min-h-screen" style={hatchedBackground}>
      <SiteNav showUserControls />

      <main className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Badge variant="popular">SEARCH RESULTS</Badge>
          {query ? (
            <h1 className="font-display text-display-2 leading-tight font-bold text-neutral-900">
              Results for <span className="text-primary-500">&ldquo;{query}&rdquo;</span>
            </h1>
          ) : (
            <h1 className="font-display text-display-2 leading-tight font-bold text-neutral-900">
              Search Vertex
            </h1>
          )}
        </div>

        <SearchBar initialQuery={query} />

        <SearchResults query={query} />
      </main>
    </div>
  );
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
