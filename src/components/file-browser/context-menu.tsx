"use client";

import { useEffect, useRef } from "react";
import type { R2Object } from "@/types/r2";
import { motion, AnimatePresence } from "framer-motion";
import { FolderOpen, Download, Pencil, Trash2, Copy, Scissors, Clipboard, Link, Eye, FileEdit } from "lucide-react";
import { useFileBrowserStore } from "@/stores/file-browser-store";
import { isTextFile } from "@/lib/utils";

interface ContextMenuProps {
  x: number; y: number; item: R2Object | null; onClose: () => void;
  onOpen: (i: R2Object) => void; onPreview: (i: R2Object) => void; onEdit: (i: R2Object) => void;
  onRename: (i: R2Object) => void; onDelete: (i: R2Object) => void;
  onDownload: (k: string[]) => void; onPresign: (k: string) => void; onPaste: () => void;
}

function Item({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-3 w-full px-3 py-2 text-[13px] rounded-lg cursor-pointer transition-colors hover:bg-[var(--bg-surface-hover)]"
      style={{ color: danger ? "var(--danger)" : "var(--text-primary)" }}>
      {icon}{label}
    </button>
  );
}

export function ContextMenu({ x, y, item, onClose, onOpen, onPreview, onEdit, onRename, onDelete, onDownload, onPresign, onPaste }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { copyToClipboard, clipboardKeys } = useFileBrowserStore();

  useEffect(() => {
    const h1 = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    const h2 = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("mousedown", h1);
    document.addEventListener("keydown", h2);
    return () => { document.removeEventListener("mousedown", h1); document.removeEventListener("keydown", h2); };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div ref={ref}
        initial={{ opacity: 0, scale: 0.93, y: -3 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93 }}
        transition={{ duration: 0.12 }}
        className="fixed z-50 rounded-xl p-1.5 min-w-[200px]"
        style={{
          top: Math.min(y, window.innerHeight - 320),
          left: Math.min(x, window.innerWidth - 220),
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-xl)",
        }}>
        {item ? (
          <>
            {item.isFolder ? (
              <Item icon={<FolderOpen size={15} />} label="Open" onClick={() => { onOpen(item); onClose(); }} />
            ) : (
              <>
                <Item icon={<Eye size={15} />} label="Preview" onClick={() => { onPreview(item); onClose(); }} />
                {isTextFile(item.name) && <Item icon={<FileEdit size={15} />} label="Edit" onClick={() => { onEdit(item); onClose(); }} />}
              </>
            )}
            <Item icon={<Download size={15} />} label="Download" onClick={() => { onDownload([item.key]); onClose(); }} />
            <div className="my-1 mx-2 h-px" style={{ background: "var(--border)" }} />
            <Item icon={<Pencil size={15} />} label="Rename" onClick={() => { onRename(item); onClose(); }} />
            <Item icon={<Copy size={15} />} label="Copy" onClick={() => { copyToClipboard([item.key], "copy"); onClose(); }} />
            <Item icon={<Scissors size={15} />} label="Cut" onClick={() => { copyToClipboard([item.key], "cut"); onClose(); }} />
            {!item.isFolder && <Item icon={<Link size={15} />} label="Share Link" onClick={() => { onPresign(item.key); onClose(); }} />}
            <div className="my-1 mx-2 h-px" style={{ background: "var(--border)" }} />
            <Item icon={<Trash2 size={15} />} label="Delete" danger onClick={() => { onDelete(item); onClose(); }} />
          </>
        ) : clipboardKeys.length > 0 ? (
          <Item icon={<Clipboard size={15} />} label={`Paste (${clipboardKeys.length})`} onClick={() => { onPaste(); onClose(); }} />
        ) : (
          <div className="px-3 py-2 text-[12px]" style={{ color: "var(--text-muted)" }}>No actions</div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
