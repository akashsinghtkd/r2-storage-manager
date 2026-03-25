"use client";

import type { UploadProgress as UploadProgressType } from "@/types/r2";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertCircle, Loader2, Upload } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface Props { uploads: UploadProgressType[]; onClear: () => void; }

export function UploadProgressPanel({ uploads, onClear }: Props) {
  if (uploads.length === 0) return null;
  const active = uploads.filter((u) => u.status === "uploading" || u.status === "pending");

  return (
    <AnimatePresence>
      <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
        className="fixed bottom-6 right-6 z-30 w-80 rounded-2xl overflow-hidden"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}>

        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--accent-subtle)" }}>
              <Upload size={13} style={{ color: "var(--accent)" }} />
            </div>
            <span className="text-[13px] font-semibold">Uploads</span>
          </div>
          {active.length === 0 && (
            <button onClick={onClear} className="p-1 rounded cursor-pointer hover:bg-[var(--bg-surface-hover)]">
              <X size={14} style={{ color: "var(--text-muted)" }} />
            </button>
          )}
        </div>

        <div className="max-h-48 overflow-y-auto">
          {uploads.map((u) => (
            <div key={u.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: "1px solid var(--border-light)" }}>
              {u.status === "uploading" && <Loader2 size={14} className="animate-spin shrink-0" style={{ color: "var(--accent)" }} />}
              {u.status === "completed" && <CheckCircle2 size={14} className="shrink-0" style={{ color: "var(--success)" }} />}
              {u.status === "error" && <AlertCircle size={14} className="shrink-0" style={{ color: "var(--danger)" }} />}
              {u.status === "pending" && <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ border: "2px solid var(--text-muted)" }} />}
              <div className="flex-1 min-w-0">
                <div className="text-[12px] truncate font-medium">{u.fileName}</div>
                <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{formatBytes(u.total)}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
