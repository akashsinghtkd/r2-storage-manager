"use client";

import { motion } from "framer-motion";
import { CloudUpload, FolderPlus, ArrowUpCircle } from "lucide-react";

interface EmptyStateProps {
  onUpload: () => void;
  onNewFolder: () => void;
}

export function EmptyState({ onUpload, onNewFolder }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center h-full gap-6 px-6"
    >
      <div className="relative">
        <div
          className="absolute inset-0 blur-2xl opacity-50 scale-150 rounded-full pointer-events-none"
          style={{ background: "var(--gradient-brand)" }}
        />
        <motion.div
          animate={{ y: [0, -7, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-[5.5rem] h-[5.5rem] rounded-[var(--radius-xl)] flex items-center justify-center"
          style={{
            background: "linear-gradient(145deg, var(--accent-subtle) 0%, color-mix(in srgb, var(--bg-surface) 70%, var(--accent-subtle)) 100%)",
            border: "1px dashed color-mix(in srgb, var(--accent) 45%, transparent)",
            boxShadow: "var(--shadow-md), 0 0 40px var(--accent-glow), 0 0 0 1px color-mix(in srgb, var(--accent) 20%, transparent)",
          }}
        >
          <ArrowUpCircle size={40} strokeWidth={1.5} style={{ color: "var(--accent)" }} />
        </motion.div>
      </div>

      <div className="text-center max-w-sm">
        <h3 className="text-xl font-bold mb-2 tracking-tight">This folder is empty</h3>
        <p className="text-[14px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Drop files anywhere in this window, or upload and organize with the actions below.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={onUpload}
          className="flex items-center gap-2 px-6 py-3 rounded-[var(--radius-lg)] text-[13px] font-bold cursor-pointer"
          style={{
            background: "var(--gradient-brand)",
            color: "white",
            boxShadow: "var(--shadow-md), 0 0 0 1px rgba(255,255,255,0.15) inset",
          }}>
          <CloudUpload size={17} strokeWidth={2.25} /> Upload files
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={onNewFolder}
          className="flex items-center gap-2 px-6 py-3 rounded-[var(--radius-lg)] text-[13px] font-bold cursor-pointer"
          style={{ background: "var(--bg-input)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}>
          <FolderPlus size={17} strokeWidth={2.25} /> New folder
        </motion.button>
      </div>
    </motion.div>
  );
}
