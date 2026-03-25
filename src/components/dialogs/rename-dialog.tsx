"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Pencil, Loader2 } from "lucide-react";
import { useFileBrowserStore } from "@/stores/file-browser-store";
import { getParentPrefix } from "@/lib/utils";

interface Props { open: boolean; onClose: () => void; currentKey: string; currentName: string; isFolder: boolean; }

export function RenameDialog({ open, onClose, currentKey, currentName, isFolder }: Props) {
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { currentPrefix } = useFileBrowserStore();

  const handleRename = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === currentName) return;
    setLoading(true);
    try {
      const parent = getParentPrefix(currentKey);
      const newKey = isFolder ? `${parent}${trimmed}/` : `${parent}${trimmed}`;
      const res = await fetch("/api/r2/object", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rename", key: currentKey, newKey }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Renamed to "${trimmed}"`);
      queryClient.invalidateQueries({ queryKey: ["objects", currentPrefix] });
      onClose();
    } catch { toast.error("Failed to rename"); }
    finally { setLoading(false); }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "var(--bg-overlay)" }} onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="rounded-2xl p-6 w-full max-w-[420px]"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}
            onClick={(e) => e.stopPropagation()}>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--accent-subtle)" }}>
                <Pencil size={20} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <h2 className="text-base font-bold">Rename {isFolder ? "Folder" : "File"}</h2>
                <p className="text-[11px] truncate max-w-[280px]" style={{ color: "var(--text-muted)" }}>{currentName}</p>
              </div>
            </div>

            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()} autoFocus
              className="w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all focus:ring-2"
              style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)", '--tw-ring-color': 'var(--ring)' } as React.CSSProperties} />

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer"
                style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}>Cancel</button>
              <button onClick={handleRename} disabled={loading || !name.trim() || name.trim() === currentName}
                className="px-5 py-2.5 rounded-xl text-[13px] font-semibold disabled:opacity-40 cursor-pointer flex items-center gap-2"
                style={{ background: "var(--gradient-brand)", color: "white" }}>
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? "Renaming..." : "Rename"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
