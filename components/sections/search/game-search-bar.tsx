"use client";

import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Input } from "@/components/ui/input";

export function GameSearchBar({ query }: { query: string }) {
  const router = useRouter();
  const [value, setValue] = useState(query);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = value.trim();
    const params = new URLSearchParams();
    if (trimmed) {
      params.set("q", trimmed);
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form className="relative" onSubmit={handleSubmit}>
      <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="pl-9"
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search for a game by name..."
        value={value}
      />
    </form>
  );
}
