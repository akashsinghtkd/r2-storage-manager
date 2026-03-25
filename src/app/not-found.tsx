import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you are looking for does not exist. Return to R2 Storage Manager dashboard.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background p-8">
      <div className="text-center">
        <h1 className="text-7xl font-extrabold tracking-tight text-foreground/10 mb-4">404</h1>
        <h2 className="text-xl font-bold tracking-tight mb-2">Page not found</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
      </div>
      <Link
        href="/"
        className="inline-flex items-center justify-center h-10 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
