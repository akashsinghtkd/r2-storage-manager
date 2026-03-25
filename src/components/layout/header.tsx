"use client";

import { useTheme } from "next-themes";
import { useFileBrowserStore } from "@/stores/file-browser-store";
import { useAuthStore } from "@/stores/auth-store";
import { motion } from "framer-motion";
import { Sun, Moon, ChevronRight, Home, Bell } from "lucide-react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { currentPrefix, setPrefix } = useFileBrowserStore();
  const { user } = useAuthStore();

  const segments = currentPrefix ? currentPrefix.replace(/\/$/, "").split("/") : [];

  return (
    <header
      className="h-[58px] flex items-center justify-between px-6 md:px-9 shrink-0 gap-4"
      style={{
        borderBottom: "1px solid var(--border-light)",
        background: "color-mix(in srgb, var(--bg-surface) 88%, transparent)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-0.5 text-[13px] min-w-0 overflow-x-auto overflow-y-hidden py-1 px-1 -mx-1 rounded-[var(--radius-lg)] max-w-[min(100%,40rem)]"
        style={{ background: "var(--bg-input)", border: "1px solid var(--border-light)" }}
      >
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={() => setPrefix("")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] shrink-0 cursor-pointer transition-all"
          style={{
            background: !currentPrefix ? "var(--bg-surface)" : "transparent",
            color: !currentPrefix ? "var(--accent)" : "var(--text-secondary)",
            fontWeight: !currentPrefix ? 700 : 500,
            boxShadow: !currentPrefix ? "var(--shadow-xs)" : "none",
          }}
        >
          <Home size={15} strokeWidth={2.25} />
          All Files
        </motion.button>

        {segments.map((segment, index) => {
          const path = segments.slice(0, index + 1).join("/") + "/";
          const isLast = index === segments.length - 1;
          return (
            <motion.div
              key={path}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-0.5 shrink-0"
            >
              <ChevronRight size={14} style={{ color: "var(--text-muted)", opacity: 0.45 }} />
              <button
                type="button"
                onClick={() => setPrefix(path)}
                className={`px-3 py-1.5 rounded-[10px] cursor-pointer transition-all font-medium ${!isLast ? "hover:bg-[var(--bg-surface-hover)]" : ""}`}
                style={{
                  background: isLast ? "var(--bg-surface)" : "transparent",
                  color: isLast ? "var(--accent)" : "var(--text-secondary)",
                  fontWeight: isLast ? 700 : 500,
                  boxShadow: isLast ? "var(--shadow-xs)" : "none",
                }}
              >
                {segment}
              </button>
            </motion.div>
          );
        })}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center cursor-pointer transition-colors"
          style={{ background: "var(--bg-input)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}
          title="Toggle theme"
        >
          <motion.div
            key={theme}
            initial={{ rotate: -30, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
          >
            {theme === "dark" ? <Sun size={17} strokeWidth={2} /> : <Moon size={17} strokeWidth={2} />}
          </motion.div>
        </motion.button>

        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center text-[11px] font-bold ring-2 ring-black/5 dark:ring-white/15"
          style={{ background: "var(--gradient-brand)", color: "white", boxShadow: "0 4px 14px var(--accent-glow)" }}
        >
          {user?.name?.slice(0, 2).toUpperCase() || "??"}
        </div>
      </div>
    </header>
  );
}
