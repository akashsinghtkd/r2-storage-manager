"use client";

import { useState, useEffect } from "react";
import type { R2Object } from "@/types/r2";
import { formatBytes, isImageFile, isTextFile, getFileColor } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Download, Pencil, Trash2, Link, Eye, Copy,
  Folder, FileText, Image, Film, Music, FileCode, File, Archive,
  Calendar, Weight, Hash, FileType,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface DetailPanelProps {
  item: R2Object | null;
  onClose: () => void;
  onPreview: (item: R2Object) => void;
  onRename: (item: R2Object) => void;
  onDelete: (item: R2Object) => void;
  onPresign: (key: string) => void;
  onDownload: (keys: string[]) => void;
}

function getIcon(item: R2Object, size: number = 32) {
  if (item.isFolder) return <Folder size={size} />;
  const n = item.name.toLowerCase();
  if (isImageFile(n)) return <Image size={size} />;
  if (n.match(/\.(mp4|webm|mov|avi|mkv)$/)) return <Film size={size} />;
  if (n.match(/\.(mp3|wav|flac|aac|ogg)$/)) return <Music size={size} />;
  if (n.match(/\.(js|ts|tsx|jsx|py|rb|go|rs|java|c|cpp|css|html|json|xml|yaml|yml|sh)$/)) return <FileCode size={size} />;
  if (n.match(/\.(zip|tar|gz|rar|7z)$/)) return <Archive size={size} />;
  if (n.match(/\.(txt|md|csv|log|pdf|doc|docx)$/)) return <FileText size={size} />;
  return <File size={size} />;
}

export function DetailPanel({
  item, onClose, onPreview, onRename, onDelete, onPresign, onDownload,
}: DetailPanelProps) {
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  useEffect(() => {
    setThumbnailUrl(null);
    if (item && isImageFile(item.name)) {
      fetch("/api/r2/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: item.key, expiresIn: 300 }),
      })
        .then((r) => r.json())
        .then((d) => setThumbnailUrl(d.url))
        .catch(() => {});
    }
  }, [item]);

  const color = item
    ? item.isFolder
      ? { bg: "rgba(245,158,11,0.1)", icon: "var(--file-folder)" }
      : getFileColor(item.name)
    : { bg: "transparent", icon: "var(--text-muted)" };

  const ext = item?.name.split(".").pop()?.toUpperCase() || "";

  return (
    <AnimatePresence>
      {item && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="shrink-0 overflow-hidden flex flex-col h-full min-h-0"
          style={{
            borderLeft: "1px solid var(--border)",
            background: "var(--bg-surface)",
          }}
        >
          <div className="flex flex-col h-full min-h-0 w-[320px]">
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0 gap-3"
              style={{
                borderBottom: "1px solid var(--border-light)",
                background: "color-mix(in srgb, var(--bg-surface) 92%, transparent)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <span className="text-[13px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
                Details
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-[var(--radius)] cursor-pointer transition-colors hover:bg-[var(--bg-surface-hover)]"
                style={{ color: "var(--text-muted)" }}
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            {/* Content */}
            <div
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain main-panel-scroll px-4 py-4 space-y-5"
              style={{ background: "var(--bg-body)" }}
            >
              {/* Thumbnail or icon */}
              <div className="flex flex-col items-center gap-3">
                {thumbnailUrl ? (
                  <div className="w-full aspect-video rounded-[var(--radius-lg)] overflow-hidden"
                    style={{ background: "var(--bg-input)", border: "1px solid var(--border-light)" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbnailUrl} alt={item.name}
                      className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-[var(--radius-xl)] flex items-center justify-center"
                    style={{ background: color.bg, color: color.icon }}>
                    {getIcon(item, 36)}
                  </div>
                )}
                <div className="text-center">
                  <p className="text-[14px] font-bold break-all leading-tight">{item.name}</p>
                  {!item.isFolder && ext && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1 inline-block"
                      style={{ background: color.bg, color: color.icon }}>.{ext}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2">
                {!item.isFolder && (
                  <button onClick={() => onPreview(item)}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-[var(--radius)] cursor-pointer transition-colors hover:bg-[var(--bg-surface-hover)]"
                    style={{ background: "var(--bg-input)", border: "1px solid var(--border-light)" }}>
                    <Eye size={16} style={{ color: "var(--accent)" }} />
                    <span className="text-[10px] font-semibold" style={{ color: "var(--text-secondary)" }}>Preview</span>
                  </button>
                )}
                <button onClick={() => onDownload([item.key])}
                  className="flex flex-col items-center gap-1.5 py-3 rounded-[var(--radius)] cursor-pointer transition-colors hover:bg-[var(--bg-surface-hover)]"
                  style={{ background: "var(--bg-input)", border: "1px solid var(--border-light)" }}>
                  <Download size={16} style={{ color: "var(--accent)" }} />
                  <span className="text-[10px] font-semibold" style={{ color: "var(--text-secondary)" }}>Download</span>
                </button>
                {!item.isFolder && (
                  <button onClick={() => onPresign(item.key)}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-[var(--radius)] cursor-pointer transition-colors hover:bg-[var(--bg-surface-hover)]"
                    style={{ background: "var(--bg-input)", border: "1px solid var(--border-light)" }}>
                    <Link size={16} style={{ color: "var(--accent)" }} />
                    <span className="text-[10px] font-semibold" style={{ color: "var(--text-secondary)" }}>Share</span>
                  </button>
                )}
              </div>

              {/* Metadata */}
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                  Properties
                </p>

                <MetaRow icon={<Hash size={13} />} label="Key" value={item.key} copyable />
                {!item.isFolder && (
                  <MetaRow icon={<Weight size={13} />} label="Size" value={formatBytes(item.size)} />
                )}
                {!item.isFolder && ext && (
                  <MetaRow icon={<FileType size={13} />} label="Type" value={`.${ext}`} />
                )}
                {item.lastModified && (
                  <MetaRow icon={<Calendar size={13} />} label="Modified"
                    value={format(new Date(item.lastModified), "MMM d, yyyy · HH:mm")} />
                )}
                {item.etag && (
                  <MetaRow icon={<Hash size={13} />} label="ETag" value={item.etag.replace(/"/g, "")} copyable />
                )}
              </div>

              {/* Danger zone */}
              <div className="space-y-2 pt-2" style={{ borderTop: "1px solid var(--border-light)" }}>
                <button onClick={() => onRename(item)}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-[var(--radius)] text-[12px] font-medium cursor-pointer transition-colors hover:bg-[var(--bg-surface-hover)]">
                  <Pencil size={14} style={{ color: "var(--text-muted)" }} /> Rename
                </button>
                <button onClick={() => onDelete(item)}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-[var(--radius)] text-[12px] font-medium cursor-pointer transition-colors hover:bg-[var(--danger-subtle)]"
                  style={{ color: "var(--danger)" }}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

function MetaRow({ icon, label, value, copyable }: { icon: React.ReactNode; label: string; value: string; copyable?: boolean }) {
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="flex items-start gap-2.5 px-3 py-2 rounded-[var(--radius)] hover:bg-[var(--bg-surface-hover)] group transition-colors">
      <span className="mt-0.5 shrink-0" style={{ color: "var(--text-muted)" }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{label}</p>
        <p className="text-[12px] font-medium break-all leading-relaxed">{value}</p>
      </div>
      {copyable && (
        <button onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 p-1 rounded cursor-pointer transition-opacity shrink-0 mt-0.5"
          title="Copy">
          <Copy size={12} style={{ color: "var(--text-muted)" }} />
        </button>
      )}
    </div>
  );
}
