"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { TextInput } from "@/components/ui/input";

export function SearchBar({ initialQuery }: { initialQuery: string }) {
  const [value, setValue] = useState(initialQuery);
  const router = useRouter();

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        const trimmed = value.trim();
        if (!trimmed) return;
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      }}
      className="w-full max-w-xl mx-auto"
    >
      <TextInput
        showSearchIcon
        shortcut="⌘K"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search for a topic, e.g. “data fetching”"
        aria-label="Search courses and lessons"
      />
    </form>
  );
}
