"use client";

import { useState, useEffect } from "react";
import type { R2Object } from "@/types/r2";
import { isImageFile, isVideoFile, isAudioFile, isPdfFile, isTextFile, formatBytes } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, ChevronLeft, ChevronRight, Loader2, FileWarning } from "lucide-react";
import { format } from "date-fns";

interface Props { open: boolean; onClose: () => void; item: R2Object | null; items: R2Object[]; onNavigate: (i: R2Object) => void; }

export function PreviewDialog({ open, onClose, item, items, onNavigate }: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fileItems = items.filter((i) => !i.isFolder);
  const idx = item ? fileItems.findIndex((i) => i.key === item.key) : -1;

  useEffect(() => {
    if (!item || !open) { setPreviewUrl(null); setTextContent(null); return; }
    setLoading(true); setPreviewUrl(null); setTextContent(null);

    if (isTextFile(item.name)) {
      fetch(`/api/r2/object?key=${encodeURIComponent(item.key)}`)
        .then((r) => r.text()).then((t) => { setTextContent(t); setLoading(false); })
        .catch(() => setLoading(false));
    } else {
      fetch("/api/r2/presign", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: item.key, expiresIn: 300 }) })
        .then((r) => r.json()).then((d) => { setPreviewUrl(d.url); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [item, open]);

  if (!open || !item) return null;

  const handleDownload = async () => {
    const res = await fetch("/api/r2/download", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keys: [item.key] }) });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = item.name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const content = () => {
    if (loading) return <div className="flex items-center justify-center h-full"><Loader2 size={28} className="animate-spin" style={{ color: "var(--accent)" }} /></div>;
    if (isImageFile(item.name) && previewUrl) return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-center h-full p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={previewUrl} alt={item.name} className="max-w-full max-h-full object-contain rounded-xl" style={{ boxShadow: "var(--shadow-xl)" }} />
      </motion.div>
    );
    if (isVideoFile(item.name) && previewUrl) return <div className="flex items-center justify-center h-full p-6"><video src={previewUrl} controls className="max-w-full max-h-full rounded-xl" style={{ boxShadow: "var(--shadow-xl)" }} /></div>;
    if (isAudioFile(item.name) && previewUrl) return <div className="flex items-center justify-center h-full"><audio src={previewUrl} controls className="w-full max-w-md" /></div>;
    if (isPdfFile(item.name) && previewUrl) return <iframe src={previewUrl} className="w-full h-full border-0 rounded-xl m-6" title={item.name} />;
    if (isTextFile(item.name) && textContent !== null) return (
      <div className="h-full overflow-auto m-6 rounded-xl" style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}>
        <pre className="p-5 text-[13px] font-mono whitespace-pre-wrap leading-relaxed">{textContent}</pre>
      </div>
    );
    return <div className="flex flex-col items-center justify-center h-full gap-3">
      <FileWarning size={40} style={{ color: "var(--text-muted)" }} />
      <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>Preview not available</p>
      <button onClick={handleDownload} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold cursor-pointer"
        style={{ background: "var(--gradient-brand)", color: "white" }}><Download size={15} /> Download</button>
    </div>;
  };

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(0,0,0,0.92)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 z-10" style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(12px)" }}>
          <div className="text-white min-w-0">
            <div className="text-[14px] font-semibold truncate">{item.name}</div>
            <div className="text-[11px] opacity-60">
              {formatBytes(item.size)}{item.lastModified && ` · ${format(new Date(item.lastModified), "MMM d, yyyy HH:mm")}`}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownload} className="p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"><Download size={17} /></button>
            <button onClick={onClose} className="p-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"><X size={17} /></button>
          </div>
        </div>

        {/* Nav */}
        {idx > 0 && <button onClick={() => onNavigate(fileItems[idx - 1])}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-xl text-white/40 hover:text-white hover:bg-white/10 z-10 cursor-pointer"><ChevronLeft size={28} /></button>}
        {idx < fileItems.length - 1 && <button onClick={() => onNavigate(fileItems[idx + 1])}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl text-white/40 hover:text-white hover:bg-white/10 z-10 cursor-pointer"><ChevronRight size={28} /></button>}

        <div className="flex-1 overflow-hidden">{content()}</div>
        <div className="text-center py-2 text-[11px] text-white/30">{idx + 1} / {fileItems.length}</div>
      </motion.div>
    </AnimatePresence>
  );
}
