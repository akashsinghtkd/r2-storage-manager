"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { ListResponse } from "@/types/r2";

async function fetchObjects(prefix: string): Promise<ListResponse> {
  const params = new URLSearchParams({ prefix, delimiter: "/" });
  const res = await apiFetch(`/api/r2/objects?${params}`);
  if (!res.ok) throw new Error("Failed to fetch objects");
  return res.json();
}

export function useObjects(prefix: string) {
  return useQuery({
    queryKey: ["objects", prefix],
    queryFn: () => fetchObjects(prefix),
    staleTime: 30000,
  });
}
