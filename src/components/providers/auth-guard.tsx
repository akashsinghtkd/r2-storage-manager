"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { Cloud } from "lucide-react";
import { motion } from "framer-motion";

const PUBLIC_PATHS = ["/login", "/signup"];

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isGuest, isLoading, isReady, fetchUser } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (!isReady) return;
    const isPublicPage = PUBLIC_PATHS.includes(pathname);
    const isAuthenticated = !!user || isGuest;

    // Redirect to login only if not authenticated and not on a public page
    if (!isAuthenticated && !isPublicPage) {
      router.replace("/login");
    }

    // Redirect away from login/signup if already authenticated
    if (isAuthenticated && isPublicPage) {
      router.replace("/");
    }
  }, [user, isGuest, isReady, pathname, router]);

  if (!isReady) {
    return (
      <div
        className="flex flex-col h-screen items-center justify-center gap-6"
        style={{
          background: "var(--bg-body)",
          backgroundImage:
            "radial-gradient(ellipse 120% 80% at 50% -30%, rgba(91,92,240,0.1), transparent 55%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-5"
        >
          <div
            className="w-14 h-14 rounded-[16px] flex items-center justify-center"
            style={{ background: "var(--gradient-brand)", boxShadow: "0 8px 32px var(--accent-glow)" }}
          >
            <Cloud size={24} color="white" strokeWidth={1.75} />
          </div>
          <div className="flex items-center gap-2.5">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 rounded-full border-2 border-t-transparent"
              style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
            />
            <span className="text-[13px] font-semibold" style={{ color: "var(--text-muted)" }}>
              Loading...
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  const isPublicPage = PUBLIC_PATHS.includes(pathname);
  const isAuthenticated = !!user || isGuest;

  if (isPublicPage) return <>{children}</>;
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
