"use client";

import { useDropzone } from "react-dropzone";
import { useUpload } from "@/hooks/use-upload";
import { useFileBrowserStore } from "@/stores/file-browser-store";
import { motion, AnimatePresence } from "framer-motion";
import { CloudUpload } from "lucide-react";

export function UploadZone({ children }: { children: React.ReactNode }) {
  const { currentPrefix } = useFileBrowserStore();
  const { uploadFiles } = useUpload(currentPrefix);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => { if (files.length > 0) uploadFiles(files); },
    noClick: true,
    noKeyboard: true,
  });

  return (
    <div
      {...getRootProps()}
      className="relative flex-1 min-h-0 min-w-0"
      style={{ background: "var(--bg-body)" }}
    >
      <input {...getInputProps()} />
      {children}
      <AnimatePresence>
        {isDragActive && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-2 z-40 flex flex-col items-center justify-center gap-4 rounded-[var(--radius-xl)]"
            style={{ background: "var(--accent-subtle)", border: "2px dashed var(--accent)" }}>
            <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1.2, repeat: Infinity }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "var(--gradient-brand)", boxShadow: "0 8px 24px var(--accent-glow)" }}>
                <CloudUpload size={28} color="white" />
              </div>
            </motion.div>
            <p className="text-[15px] font-bold" style={{ color: "var(--accent)" }}>Drop files to upload</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
