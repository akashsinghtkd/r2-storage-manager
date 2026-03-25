"use client";

import { useState, useEffect } from "react";
import { useFileBrowserStore } from "@/stores/file-browser-store";
import type { R2Object } from "@/types/r2";
import { formatBytes, isImageFile, getFileColor } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Folder, FileText, Image, Film, Music, FileCode, File, Archive, Check,
} from "lucide-react";
import { format } from "date-fns";

function FileIcon({ item, size = 32 }: { item: R2Object; size?: number }) {
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

function GridItemThumbnail({
  fileItem,
  color,
}: {
  fileItem: R2Object;
  color: { bg: string; text: string; icon: string };
}) {
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [imageBroken, setImageBroken] = useState(false);

  const isImg = !fileItem.isFolder && isImageFile(fileItem.name);

  useEffect(() => {
    if (!isImg) return;
    setThumbUrl(null);
    setImageBroken(false);
    const ac = new AbortController();
    fetch("/api/r2/presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: fileItem.key, expiresIn: 600 }),
      signal: ac.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("presign"))))
      .then((d: { url?: string }) => {
        if (d?.url) setThumbUrl(d.url);
      })
      .catch(() => { /* keep placeholder icon */ });
    return () => ac.abort();
  }, [fileItem.key, isImg]);

  if (!isImg) {
    return (
      <div
        className="w-[72px] h-[72px] rounded-[16px] flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-[1.06]"
        style={{ background: color.bg, color: color.icon }}
      >
        <FileIcon item={fileItem} size={32} />
      </div>
    );
  }

  const showImage = thumbUrl && !imageBroken;

  return (
    <div
      className="w-full max-h-[128px] aspect-[4/3] rounded-[14px] overflow-hidden mb-4 transition-transform duration-200 group-hover:scale-[1.02] ring-1 ring-black/[0.06] dark:ring-white/[0.08]"
      style={{ background: "var(--bg-input)" }}
    >
      {showImage ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={thumbUrl}
          alt={fileItem.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
          onError={() => {
            setImageBroken(true);
            setThumbUrl(null);
          }}
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ background: color.bg, color: color.icon }}
        >
          <FileIcon item={fileItem} size={32} />
        </div>
      )}
    </div>
  );
}

interface GridViewProps {
  items: R2Object[];
  onOpen: (item: R2Object) => void;
  onContextMenu: (e: React.MouseEvent, item: R2Object) => void;
}

export function GridView({ items, onOpen, onContextMenu }: GridViewProps) {
  const { selectedKeys, selectKey, toggleSelectKey, setDetailItem } = useFileBrowserStore();

  return (
    <div
      className="grid gap-4 px-6 md:px-8 pt-8 md:pt-10 pb-6 md:pb-8"
      style={{ gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))" }}
    >
      {items.map((fileItem, index) => {
        const isSelected = selectedKeys.has(fileItem.key);
        const color = fileItem.isFolder
          ? { bg: "rgba(245,158,11,0.08)", text: "var(--file-folder)", icon: "var(--file-folder)" }
          : getFileColor(fileItem.name);
        const ext = fileItem.name.split(".").pop()?.toUpperCase() || "";

        return (
          <motion.div
            key={fileItem.key}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.03, 0.35), duration: 0.3 }}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="group relative flex flex-col items-center px-5 pt-7 pb-5 rounded-[18px] cursor-pointer"
            style={{
              background: isSelected
                ? "var(--accent-subtle)"
                : "var(--bg-surface)",
              border: isSelected
                ? "2px solid var(--accent)"
                : "1.5px solid var(--border-light)",
              boxShadow: isSelected
                ? "0 0 0 3px var(--accent-glow), var(--shadow-md)"
                : "var(--shadow-sm)",
              transition: "box-shadow 0.2s, border-color 0.2s, background 0.2s",
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (e.ctrlKey || e.metaKey) {
                toggleSelectKey(fileItem.key);
              } else {
                selectKey(fileItem.key);
                setDetailItem(fileItem.key);
              }
            }}
            onDoubleClick={() => onOpen(fileItem)}
            onContextMenu={(e) => { e.stopPropagation(); onContextMenu(e, fileItem); }}
            data-file-item
          >
            {/* Checkbox — top-left */}
            <div className={`absolute top-3.5 left-3.5 transition-all duration-150 ${isSelected ? "opacity-100 scale-100" : "opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100"}`}>
              <div
                className="w-[22px] h-[22px] rounded-[7px] flex items-center justify-center"
                style={{
                  background: isSelected ? "var(--accent)" : "var(--bg-surface)",
                  border: isSelected ? "none" : "1.5px solid var(--border)",
                  boxShadow: "var(--shadow-xs)",
                }}
              >
                {isSelected && <Check size={13} color="white" strokeWidth={3} />}
              </div>
            </div>

            {/* Extension badge — top-right */}
            {!fileItem.isFolder && ext && (
              <div className="absolute top-3.5 right-3.5">
                <span
                  className="text-[9px] font-extrabold uppercase px-2 py-[3px] rounded-[6px] tracking-wide"
                  style={{ background: color.bg, color: color.text }}
                >
                  {ext}
                </span>
              </div>
            )}

            {/* Thumbnail (images) or icon */}
            <GridItemThumbnail fileItem={fileItem} color={color} />

            {/* Name */}
            <p
              className="text-[13px] font-bold text-center w-full truncate leading-tight mb-1.5"
              title={fileItem.name}
            >
              {fileItem.name}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "var(--text-muted)" }}>
              {fileItem.isFolder ? (
                <span className="font-semibold" style={{ color: color.text }}>
                  Folder
                </span>
              ) : (
                <>
                  <span>{formatBytes(fileItem.size)}</span>
                  {fileItem.lastModified && (
                    <>
                      <span style={{ opacity: 0.4 }}>·</span>
                      <span>{format(new Date(fileItem.lastModified), "MMM d")}</span>
                    </>
                  )}
                </>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
