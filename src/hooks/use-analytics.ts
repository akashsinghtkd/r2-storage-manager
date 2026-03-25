"use client";

import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import type { StorageAnalytics } from "@/types/r2";

async function fetchAnalytics(): Promise<StorageAnalytics> {
  const res = await apiFetch("/api/r2/analytics");
  if (!res.ok) throw new Error("Failed to fetch analytics");
  return res.json();
}

export function useAnalytics(enabled: boolean = true) {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
    enabled,
    staleTime: 300000,
  });
}
