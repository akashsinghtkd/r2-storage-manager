"use client";

import { useState } from "react";
import { useSearch } from "@/hooks/use-search";
import { useFileBrowserStore } from "@/stores/file-browser-store";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Folder, File, Loader2 } from "lucide-react";
import { formatBytes, getParentPrefix, getFileColor } from "@/lib/utils";

interface Props { open: boolean; onClose: () => void; }

export function SearchDialog({ open, onClose }: Props) {
  const [query, setQuery] = useState("");
  const { data: results, isLoading } = useSearch(query);
  const { setPrefix, navigateToFolder } = useFileBrowserStore();

  const handleSelect = (key: string, isFolder: boolean) => {
    if (isFolder) navigateToFolder(key);
    else setPrefix(getParentPrefix(key));
    setQuery(""); onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
          style={{ background: "var(--bg-overlay)" }} onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -12 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="rounded-2xl w-full max-w-xl overflow-hidden"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}
            onClick={(e) => e.stopPropagation()}>

            {/* Search input */}
            <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <Search size={18} style={{ color: "var(--accent)" }} />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Search files and folders..." autoFocus
                className="flex-1 bg-transparent outline-none text-[14px] font-medium"
                style={{ color: "var(--text-primary)" }} />
              {isLoading && <Loader2 size={16} className="animate-spin" style={{ color: "var(--accent)" }} />}
            </div>

            {/* Results */}
            {results && results.length > 0 && (
              <div className="max-h-[50vh] overflow-y-auto py-1">
                {results.map((item, i) => {
                  const color = item.isFolder
                    ? { bg: "rgba(245,158,11,0.1)", icon: "var(--file-folder)" }
                    : getFileColor(item.name);
                  return (
                    <motion.button key={item.key}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.025 }}
                      onClick={() => handleSelect(item.key, item.isFolder)}
                      className="flex items-center gap-3 w-full px-5 py-3 text-left cursor-pointer transition-colors hover:bg-[var(--bg-surface-hover)]">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: color.bg, color: color.icon }}>
                        {item.isFolder ? <Folder size={16} /> : <File size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold truncate">{item.name}</div>
                        <div className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>{item.key}</div>
                      </div>
                      {!item.isFolder && (
                        <span className="text-[11px] font-medium shrink-0 px-2 py-0.5 rounded-full"
                          style={{ background: color.bg, color: color.icon }}>{formatBytes(item.size)}</span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}

            {query.length >= 2 && !isLoading && results?.length === 0 && (
              <div className="p-10 text-center text-[13px]" style={{ color: "var(--text-muted)" }}>
                No results for &ldquo;{query}&rdquo;
              </div>
            )}

            {query.length < 2 && (
              <div className="p-10 text-center text-[13px]" style={{ color: "var(--text-muted)" }}>
                Type at least 2 characters to search
              </div>
            )}

            <div className="flex gap-4 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border)" }}>
              <span>↵ Open</span><span>esc Close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
