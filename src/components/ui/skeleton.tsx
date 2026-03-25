"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return <div className={cn("skeleton", className)} style={style} />;
}

export function SkeletonCard() {
  return (
    <div className="flex flex-col items-center p-5 rounded-[var(--radius-xl)] gap-3"
      style={{ background: "var(--bg-surface)", border: "1px solid var(--border-light)" }}>
      <Skeleton className="w-[4.25rem] h-[4.25rem] rounded-[var(--radius-lg)]" />
      <Skeleton className="h-4 w-24 rounded-md" />
      <Skeleton className="h-3 w-16 rounded-md" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)]">
      <Skeleton className="w-[22px] h-[22px] rounded-md shrink-0" />
      <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
      <Skeleton className="h-4 flex-1 max-w-[200px] rounded-md" />
      <Skeleton className="h-3 w-16 rounded-md ml-auto" />
      <Skeleton className="h-3 w-24 rounded-md hidden md:block" />
    </div>
  );
}

export function SkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 p-6 md:p-7" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(168px, 1fr))" }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div className="px-6 py-5 md:px-7 space-y-1">
      <div className="flex items-center gap-3 px-4 py-2.5 mb-2 rounded-[var(--radius-lg)]"
        style={{ background: "var(--bg-input)", border: "1px solid var(--border-light)" }}>
        <Skeleton className="w-[22px] h-[22px] rounded-md" />
        <Skeleton className="h-3 w-12 rounded-md" />
        <Skeleton className="h-3 w-10 rounded-md ml-auto" />
        <Skeleton className="h-3 w-14 rounded-md hidden md:block" />
      </div>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div
      className="flex-1 min-h-0 overflow-y-auto main-panel-scroll px-6 py-5 md:px-8 md:py-6 space-y-6 animate-fade-up"
      style={{ background: "var(--bg-body)" }}
    >
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 rounded-[var(--radius-lg)]"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <Skeleton className="h-3 w-20 rounded-md" />
            </div>
            <Skeleton className="h-7 w-24 rounded-md mb-1" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
        ))}
      </div>
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-5 rounded-[var(--radius-lg)] h-72"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}>
          <Skeleton className="h-4 w-32 rounded-md mb-4" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <div className="p-5 rounded-[var(--radius-lg)] h-72"
          style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}>
          <Skeleton className="h-4 w-32 rounded-md mb-4" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
