"use client";

import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Link, Copy, Check, Loader2 } from "lucide-react";

interface Props { open: boolean; onClose: () => void; fileKey: string; }

export function PresignDialog({ open, onClose, fileKey }: Props) {
  const [url, setUrl] = useState("");
  const [expiry, setExpiry] = useState(3600);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/r2/presign", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: fileKey, expiresIn: expiry }) });
      if (!res.ok) throw new Error("Failed");
      setUrl((await res.json()).url);
    } catch { toast.error("Failed to generate link"); }
    finally { setLoading(false); }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true); toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
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
            className="rounded-2xl p-6 w-full max-w-lg"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xl)" }}
            onClick={(e) => e.stopPropagation()}>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "var(--accent-subtle)" }}>
                <Link size={20} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <h2 className="text-base font-bold">Share Link</h2>
                <p className="text-[11px] truncate max-w-[340px]" style={{ color: "var(--text-muted)" }}>{fileKey}</p>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <select value={expiry} onChange={(e) => setExpiry(Number(e.target.value))}
                className="flex-1 px-4 py-2.5 rounded-xl text-[13px] outline-none cursor-pointer"
                style={{ background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                <option value={3600}>1 hour</option>
                <option value={86400}>1 day</option>
                <option value={604800}>7 days</option>
              </select>
              <button onClick={handleGenerate} disabled={loading}
                className="px-5 py-2.5 rounded-xl text-[13px] font-semibold disabled:opacity-40 cursor-pointer flex items-center gap-2"
                style={{ background: "var(--gradient-brand)", color: "white" }}>
                {loading && <Loader2 size={14} className="animate-spin" />} Generate
              </button>
            </div>

            {url && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex gap-2">
                <input type="text" value={url} readOnly
                  className="flex-1 px-4 py-2.5 rounded-xl text-[12px] outline-none font-mono"
                  style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }} />
                <button onClick={handleCopy}
                  className="p-2.5 rounded-xl cursor-pointer"
                  style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}>
                  {copied ? <Check size={16} style={{ color: "var(--success)" }} /> : <Copy size={16} />}
                </button>
              </motion.div>
            )}

            <div className="flex justify-end mt-5">
              <button onClick={() => { setUrl(""); onClose(); }}
                className="px-4 py-2.5 rounded-xl text-[13px] font-medium cursor-pointer"
                style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}>Close</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
