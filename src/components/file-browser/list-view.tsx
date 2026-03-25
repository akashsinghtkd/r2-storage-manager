"use client";

import { useFileBrowserStore } from "@/stores/file-browser-store";
import type { R2Object } from "@/types/r2";
import { formatBytes, isImageFile, getFileColor } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Folder, FileText, Image, Film, Music, FileCode, File, Archive, Check,
} from "lucide-react";
import { format } from "date-fns";

function SmallIcon({ item }: { item: R2Object }) {
  if (item.isFolder) return <Folder size={18} />;
  const n = item.name.toLowerCase();
  if (isImageFile(n)) return <Image size={18} />;
  if (n.match(/\.(mp4|webm|mov|avi|mkv)$/)) return <Film size={18} />;
  if (n.match(/\.(mp3|wav|flac|aac|ogg)$/)) return <Music size={18} />;
  if (n.match(/\.(js|ts|tsx|jsx|py|rb|go|rs|java|c|cpp|css|html|json|xml|yaml|yml|sh)$/)) return <FileCode size={18} />;
  if (n.match(/\.(zip|tar|gz|rar|7z)$/)) return <Archive size={18} />;
  if (n.match(/\.(txt|md|csv|log|pdf|doc|docx)$/)) return <FileText size={18} />;
  return <File size={18} />;
}

interface ListViewProps {
  items: R2Object[];
  onOpen: (item: R2Object) => void;
  onContextMenu: (e: React.MouseEvent, item: R2Object) => void;
}

export function ListView({ items, onOpen, onContextMenu }: ListViewProps) {
  const { selectedKeys, selectKey, toggleSelectKey, selectAll, clearSelection, setDetailItem } = useFileBrowserStore();
  const allKeys = items.map((i) => i.key);
  const allSelected = allKeys.length > 0 && allKeys.every((k) => selectedKeys.has(k));

  return (
    <div className="px-6 md:px-8 pt-8 md:pt-10 pb-6 md:pb-8">
      {/* Table header */}
      <div
        className="flex items-center gap-4 px-5 py-3 mb-2 text-[10px] font-bold uppercase tracking-[0.14em] rounded-[14px]"
        style={{ background: "var(--bg-surface)", border: "1.5px solid var(--border-light)", color: "var(--text-muted)" }}
      >
        <button
          onClick={() => (allSelected ? clearSelection() : selectAll(allKeys))}
          className="w-[22px] h-[22px] rounded-[7px] flex items-center justify-center shrink-0 cursor-pointer transition-all"
          style={{
            background: allSelected ? "var(--accent)" : "var(--bg-surface)",
            border: allSelected ? "none" : "1.5px solid var(--border)",
          }}
        >
          {allSelected && <Check size={13} color="white" strokeWidth={3} />}
        </button>
        <span className="flex-1">Name</span>
        <span className="w-24 text-right">Size</span>
        <span className="w-36 text-right hidden md:block">Modified</span>
        <span className="w-20 text-right hidden lg:block">Type</span>
      </div>

      {/* Rows */}
      <div className="space-y-1.5">
        {items.map((fileItem, index) => {
          const isSelected = selectedKeys.has(fileItem.key);
          const color = fileItem.isFolder
            ? { bg: "rgba(245,158,11,0.08)", text: "var(--file-folder)", icon: "var(--file-folder)" }
            : getFileColor(fileItem.name);
          const ext = fileItem.name.split(".").pop()?.toUpperCase() || "";

          return (
            <motion.div
              key={fileItem.key}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Math.min(index * 0.02, 0.25) }}
              className="group flex items-center gap-4 px-5 py-3 rounded-[14px] cursor-pointer transition-all hover:bg-[var(--bg-surface)]"
              style={{
                background: isSelected ? "var(--accent-subtle)" : "transparent",
                border: isSelected
                  ? "1.5px solid color-mix(in srgb, var(--accent) 35%, transparent)"
                  : "1.5px solid transparent",
                boxShadow: isSelected ? "var(--shadow-xs)" : "none",
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (e.ctrlKey || e.metaKey) toggleSelectKey(fileItem.key);
                else { selectKey(fileItem.key); setDetailItem(fileItem.key); }
              }}
              onDoubleClick={() => onOpen(fileItem)}
              onContextMenu={(e) => { e.stopPropagation(); onContextMenu(e, fileItem); }}
              data-file-item
            >
              {/* Checkbox */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleSelectKey(fileItem.key); }}
                className={`w-[22px] h-[22px] rounded-[7px] flex items-center justify-center shrink-0 cursor-pointer transition-all
                  ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                style={{
                  background: isSelected ? "var(--accent)" : "var(--bg-surface)",
                  border: isSelected ? "none" : "1.5px solid var(--border)",
                }}
              >
                {isSelected && <Check size={13} color="white" strokeWidth={3} />}
              </button>

              {/* Icon + Name */}
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                  style={{ background: color.bg, color: color.icon }}
                >
                  <SmallIcon item={fileItem} />
                </div>
                <span className="text-[13px] font-semibold truncate">{fileItem.name}</span>
              </div>

              {/* Size */}
              <span className="w-24 text-right text-[12px] font-medium" style={{ color: "var(--text-muted)" }}>
                {fileItem.isFolder ? "—" : formatBytes(fileItem.size)}
              </span>

              {/* Modified */}
              <span className="w-36 text-right text-[12px] hidden md:block" style={{ color: "var(--text-muted)" }}>
                {fileItem.lastModified ? format(new Date(fileItem.lastModified), "MMM d, yyyy") : "—"}
              </span>

              {/* Type */}
              <span className="w-20 text-right hidden lg:block">
                {fileItem.isFolder ? (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: color.bg, color: color.text }}>Folder</span>
                ) : ext ? (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: color.bg, color: color.text }}>.{ext}</span>
                ) : null}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
