"use client";

import { useState, useRef } from "react";
import { useFileBrowserStore } from "@/stores/file-browser-store";
import { useUpload } from "@/hooks/use-upload";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid, List, FolderPlus, Upload, Trash2, Download,
  ArrowUpDown, RotateCw, X, FolderUp,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useBulkOperations } from "@/hooks/use-bulk-operations";
import { NewFolderDialog } from "@/components/dialogs/new-folder-dialog";
import { DeleteConfirmDialog } from "@/components/dialogs/delete-confirm-dialog";

export function Toolbar() {
  const {
    currentPrefix, viewMode, setViewMode, sortField, sortDirection, toggleSort,
    selectedKeys, clearSelection,
  } = useFileBrowserStore();

  const { uploadFiles } = useUpload(currentPrefix);
  const { bulkDownload } = useBulkOperations();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const selectedCount = selectedKeys.size;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) uploadFiles(files);
    e.target.value = "";
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["objects", currentPrefix] });
    setTimeout(() => setRefreshing(false), 600);
  };

  return (
    <>
      <div
        className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between px-6 md:px-8 py-4"
        style={{
          borderBottom: "1px solid var(--border-light)",
          background: "var(--bg-input)",
        }}
      >
        {/* ── Left: Actions ── */}
        <div className="flex items-center gap-3 flex-wrap min-w-0">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2.5 min-w-[7.5rem] h-11 px-5 sm:px-6 py-2 rounded-[var(--radius-lg)] text-[13px] font-extrabold tracking-tight cursor-pointer transition-all active:scale-[0.98] mr-0.5"
            style={{
              background: "var(--gradient-brand)",
              color: "white",
              boxShadow:
                "0 10px 24px rgba(91,92,240,0.18), 0 0 0 1px rgba(255,255,255,0.18) inset, 0 1px 0 rgba(255,255,255,0.18) inset",
              filter: "saturate(1.02)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = "saturate(1.06) brightness(1.03)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = "saturate(1.02)"; }}
          >
            <Upload size={17} strokeWidth={2.25} className="shrink-0" />
            <span className="whitespace-nowrap">Upload</span>
          </button>

          <button
            type="button"
            onClick={() => folderInputRef.current?.click()}
            className="flex items-center justify-center gap-2.5 h-11 min-w-11 sm:min-w-[8.5rem] px-4 sm:px-6 py-2 rounded-[var(--radius-lg)] text-[13px] font-semibold cursor-pointer transition-colors hover:bg-[var(--bg-surface-hover)] active:scale-[0.98]"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}
          >
            <FolderUp size={17} strokeWidth={2} className="shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">Folder upload</span>
          </button>

          <button
            type="button"
            onClick={() => setNewFolderOpen(true)}
            className="flex items-center justify-center gap-2.5 h-11 min-w-11 sm:min-w-[7.5rem] px-4 sm:px-6 py-2 rounded-[var(--radius-lg)] text-[13px] font-semibold cursor-pointer transition-colors hover:bg-[var(--bg-surface-hover)] active:scale-[0.98]"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}
          >
            <FolderPlus size={17} strokeWidth={2} className="shrink-0" />
            <span className="hidden sm:inline whitespace-nowrap">New folder</span>
          </button>

          <input ref={fileInputRef} type="file" multiple onChange={handleFileUpload} className="hidden" />
          <input ref={folderInputRef} type="file" multiple onChange={handleFileUpload} className="hidden"
            {...({ webkitdirectory: "", directory: "" } as React.InputHTMLAttributes<HTMLInputElement>)} />

          <button
            type="button"
            onClick={handleRefresh}
            className="w-11 h-11 shrink-0 rounded-[var(--radius-lg)] flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--bg-surface-hover)] active:scale-[0.98]"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}
            title="Refresh"
          >
            <motion.div animate={{ rotate: refreshing ? 360 : 0 }} transition={{ duration: 0.5 }}>
              <RotateCw size={16} style={{ color: "var(--text-muted)" }} strokeWidth={2} />
            </motion.div>
          </button>
        </div>

        {/* ── Center: Selection bar ── */}
        <AnimatePresence>
          {selectedCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="flex items-center gap-2.5 sm:gap-3 min-h-12 py-1.5 pl-4 pr-2.5 sm:pr-3 rounded-[var(--radius-lg)] w-full sm:w-auto justify-between sm:justify-start my-0.5"
              style={{
                background: "var(--accent-subtle)",
                border: "1px solid color-mix(in srgb, var(--accent) 32%, transparent)",
                boxShadow: "var(--shadow-xs)",
              }}
            >
              <span
                className="text-[12px] sm:text-[13px] font-bold pl-0.5 pr-2 tracking-tight shrink-0"
                style={{ color: "var(--accent)" }}
              >
                {selectedCount} selected
              </span>
              <div
                className="w-px h-6 shrink-0 mx-0.5"
                style={{ background: "color-mix(in srgb, var(--accent) 28%, transparent)" }}
              />
              <div className="flex items-center gap-1 pr-0.5">
                <button
                  type="button"
                  onClick={() => bulkDownload(Array.from(selectedKeys))}
                  className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-[var(--radius)] flex items-center justify-center cursor-pointer transition-colors hover:bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] active:scale-[0.96]"
                  style={{ color: "var(--accent)" }}
                  title="Download"
                >
                  <Download size={17} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteOpen(true)}
                  className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-[var(--radius)] flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--danger-subtle)] active:scale-[0.96]"
                  style={{ color: "var(--danger)" }}
                  title="Delete"
                >
                  <Trash2 size={17} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-[var(--radius)] flex items-center justify-center cursor-pointer transition-colors hover:bg-[var(--bg-surface-hover)] active:scale-[0.96]"
                  style={{ color: "var(--text-muted)" }}
                  title="Clear selection"
                >
                  <X size={17} strokeWidth={2} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Right: Sort + View ── */}
        <div
          className="flex items-center gap-3 flex-wrap w-full lg:w-auto lg:justify-end lg:shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0"
          style={{ borderTopColor: "var(--border-light)" }}
        >
          <div
            className="flex items-center rounded-[var(--radius-lg)] p-1.5 gap-1 min-h-11"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}
          >
            {(["name", "size", "lastModified"] as const).map((field) => (
              <button
                key={field}
                type="button"
                onClick={() => toggleSort(field)}
                className="flex items-center justify-center gap-1.5 h-9 min-w-[3rem] sm:min-w-[3.25rem] px-2.5 sm:px-3.5 rounded-[var(--radius)] text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.08em] sm:tracking-wider cursor-pointer transition-all active:scale-[0.97]"
                style={{
                  background: sortField === field ? "var(--bg-input)" : "transparent",
                  color: sortField === field ? "var(--accent)" : "var(--text-muted)",
                  boxShadow: sortField === field ? "var(--shadow-xs)" : "none",
                }}
              >
                {field === "lastModified" ? "Date" : field === "name" ? "Name" : "Size"}
                {sortField === field && (
                  <motion.div animate={{ rotate: sortDirection === "desc" ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ArrowUpDown size={12} strokeWidth={2.25} />
                  </motion.div>
                )}
              </button>
            ))}
          </div>

          <div
            className="flex items-center rounded-[var(--radius-lg)] p-1.5 gap-1 min-h-11"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-xs)" }}
          >
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className="h-9 w-9 shrink-0 rounded-[var(--radius)] flex items-center justify-center cursor-pointer transition-all active:scale-[0.97]"
              style={{
                background: viewMode === "grid" ? "var(--gradient-brand)" : "transparent",
                color: viewMode === "grid" ? "white" : "var(--text-muted)",
                boxShadow: viewMode === "grid"
                  ? "0 8px 18px rgba(91,92,240,0.2), 0 0 0 1px rgba(255,255,255,0.14) inset"
                  : "none",
              }}
              title="Grid view"
            >
              <LayoutGrid size={17} strokeWidth={2.25} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className="h-9 w-9 shrink-0 rounded-[var(--radius)] flex items-center justify-center cursor-pointer transition-all active:scale-[0.97]"
              style={{
                background: viewMode === "list" ? "var(--gradient-brand)" : "transparent",
                color: viewMode === "list" ? "white" : "var(--text-muted)",
                boxShadow: viewMode === "list"
                  ? "0 8px 18px rgba(91,92,240,0.2), 0 0 0 1px rgba(255,255,255,0.14) inset"
                  : "none",
              }}
              title="List view"
            >
              <List size={17} strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </div>

      <NewFolderDialog open={newFolderOpen} onClose={() => setNewFolderOpen(false)} prefix={currentPrefix} />
      <DeleteConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} keys={Array.from(selectedKeys)} onDeleted={clearSelection} />
    </>
  );
}
