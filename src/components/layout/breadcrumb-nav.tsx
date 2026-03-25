"use client";

import { useFileBrowserStore } from "@/stores/file-browser-store";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Home } from "lucide-react";

export function BreadcrumbNav() {
  const { currentPrefix, setPrefix } = useFileBrowserStore();

  const segments = currentPrefix
    ? currentPrefix.replace(/\/$/, "").split("/")
    : [];

  return (
    <nav
      className="flex items-center gap-1 px-6 py-3 overflow-x-auto"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setPrefix("")}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium shrink-0 transition-all cursor-pointer"
        style={{
          background: !currentPrefix ? "var(--accent-light)" : "transparent",
          color: !currentPrefix ? "var(--accent)" : "var(--text-secondary)",
        }}
      >
        <Home size={14} />
        <span>Root</span>
      </motion.button>

      <AnimatePresence mode="popLayout">
        {segments.map((segment, index) => {
          const path = segments.slice(0, index + 1).join("/") + "/";
          const isLast = index === segments.length - 1;

          return (
            <motion.div
              key={path}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="flex items-center gap-1 shrink-0"
            >
              <ChevronRight size={14} style={{ color: "var(--text-tertiary)" }} />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPrefix(path)}
                className="px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer"
                style={{
                  background: isLast ? "var(--accent-light)" : "transparent",
                  color: isLast ? "var(--accent)" : "var(--text-secondary)",
                  fontWeight: isLast ? 600 : 400,
                }}
              >
                {segment}
              </motion.button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </nav>
  );
}
