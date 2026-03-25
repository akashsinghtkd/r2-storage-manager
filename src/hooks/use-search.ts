"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { R2Object } from "@/types/r2";

async function fetchSearch(query: string): Promise<R2Object[]> {
  if (!query || query.length < 2) return [];
  const params = new URLSearchParams({ q: query });
  const res = await apiFetch(`/api/r2/search?${params}`);
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();
  return data.results;
}

export function useSearch(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => fetchSearch(query),
    enabled: query.length >= 2,
    staleTime: 10000,
    placeholderData: (prev) => prev,
  });
}
