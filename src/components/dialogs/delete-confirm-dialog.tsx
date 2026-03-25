"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useFileBrowserStore } from "@/stores/file-browser-store";
import { getNameFromKey } from "@/lib/utils";

interface Props { open: boolean; onClose: () => void; keys: string[]; onDeleted?: () => void; }

export function DeleteConfirmDialog({ open, onClose, keys, onDeleted }: Props) {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { currentPrefix } = useFileBrowserStore();
  const hasFolders = keys.some((k) => k.endsWith("/"));

  const handleDelete = async () => {
    setLoading(true);
    try {
      const folderKeys = keys.filter((k) => k.endsWith("/"));
      const fileKeys = keys.filter((k) => !k.endsWith("/"));
      for (const folder of folderKeys) {
        await fetch("/api/r2/folder", { method: "DELETE", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prefix: folder }) });
      }
      if (fileKeys.length > 0) {
        await fetch("/api/r2/objects", { method: "DELETE", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keys: fileKeys }) });
      }
      toast.success(`Deleted ${keys.length} item(s)`);
      queryClient.invalidateQueries({ queryKey: ["objects", currentPrefix] });
      onDeleted?.();
      onClose();
    } catch { toast.error("Failed to delete"); }
    finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {open && keys.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
          style={{ background: "var(--bg-overlay)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="rounded-[var(--radius-xl)] w-full max-w-[440px] px-6 py-7 sm:px-8 sm:py-8 mx-auto my-auto"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-xl)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4 mb-6">
              <div
                className="w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0"
                style={{ background: "var(--danger-subtle)" }}
              >
                <Trash2 size={22} strokeWidth={2} style={{ color: "var(--danger)" }} />
              </div>
              <div className="min-w-0 pt-0.5">
                <h2 className="text-lg font-bold tracking-tight leading-snug mb-2">
                  Delete {keys.length} item{keys.length === 1 ? "" : "s"}?
                </h2>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  This cannot be undone.
                </p>
              </div>
            </div>

            {hasFolders && (
              <div
                className="flex items-start gap-3 px-4 py-3.5 rounded-[var(--radius-lg)] mb-5"
                style={{ background: "var(--warning-subtle)", border: "1px solid color-mix(in srgb, var(--warning) 22%, transparent)" }}
              >
                <AlertTriangle size={18} className="shrink-0 mt-0.5" style={{ color: "var(--warning)" }} />
                <span className="text-[12px] sm:text-[13px] font-medium leading-snug" style={{ color: "var(--warning)" }}>
                  Folders will be deleted with all contents.
                </span>
              </div>
            )}

            <div
              className="max-h-36 overflow-y-auto main-panel-scroll rounded-[var(--radius-lg)] px-4 py-3.5 mb-6 space-y-2"
              style={{ background: "var(--bg-input)", border: "1px solid var(--border-light)" }}
            >
              {keys.slice(0, 8).map((key) => (
                <div
                  key={key}
                  className="text-[13px] truncate flex items-center gap-2.5 py-0.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: "var(--danger)" }} />
                  <span className="font-medium">{getNameFromKey(key)}</span>
                </div>
              ))}
              {keys.length > 8 && (
                <div className="text-[12px] pt-2 border-t font-medium" style={{ color: "var(--text-muted)", borderColor: "var(--border-light)" }}>
                  …and {keys.length - 8} more
                </div>
              )}
            </div>

            <div
              className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 mt-1"
              style={{ borderTop: "1px solid var(--border-light)" }}
            >
              <button
                type="button"
                onClick={onClose}
                className="min-h-11 px-5 py-2.5 rounded-[var(--radius-lg)] text-[13px] font-semibold cursor-pointer transition-colors hover:opacity-95"
                style={{ background: "var(--bg-input)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="min-h-11 px-6 py-2.5 rounded-[var(--radius-lg)] text-[13px] font-bold disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2 transition-opacity hover:opacity-95"
                style={{ background: "var(--danger)", color: "white", boxShadow: "var(--shadow-sm)" }}
              >
                {loading && <Loader2 size={16} className="animate-spin shrink-0" />}
                {loading ? "Deleting…" : "Delete"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
