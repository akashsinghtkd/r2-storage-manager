"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { FolderPlus, Loader2 } from "lucide-react";

interface NewFolderDialogProps { open: boolean; onClose: () => void; prefix: string; }

export function NewFolderDialog({ open, onClose, prefix }: NewFolderDialogProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/r2/folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prefix: `${prefix}${name.trim()}/` }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`Created folder "${name.trim()}"`);
      queryClient.invalidateQueries({ queryKey: ["objects", prefix] });
      setName("");
      onClose();
    } catch { toast.error("Failed to create folder"); }
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
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="rounded-2xl p-6 w-full max-w-[420px]"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}
            onClick={(e) => e.stopPropagation()}>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--accent-subtle)" }}>
                <FolderPlus size={20} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <h2 className="text-base font-bold">New Folder</h2>
                <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>Create a folder in current directory</p>
              </div>
            </div>

            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              placeholder="Folder name..." autoFocus
              className="w-full px-4 py-3 rounded-xl text-[13px] outline-none transition-all focus:ring-2"
              style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)", '--tw-ring-color': 'var(--ring)' } as React.CSSProperties} />

            <div className="flex justify-end gap-2 mt-5">
              <button onClick={onClose} className="px-4 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer"
                style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}>Cancel</button>
              <button onClick={handleCreate} disabled={loading || !name.trim()}
                className="px-5 py-2.5 rounded-xl text-[13px] font-semibold disabled:opacity-40 cursor-pointer flex items-center gap-2"
                style={{ background: "var(--gradient-brand)", color: "white" }}>
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
