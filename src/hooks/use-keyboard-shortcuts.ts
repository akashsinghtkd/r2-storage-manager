"use client";

import { useEffect } from "react";
import { useFileBrowserStore } from "@/stores/file-browser-store";
import { useBulkOperations } from "./use-bulk-operations";

export function useKeyboardShortcuts() {
  const store = useFileBrowserStore();
  const { bulkDelete, bulkDownload, pasteFromClipboard } = useBulkOperations();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === "a") {
        e.preventDefault();
        return;
      }

      if (isMod && e.key === "c") {
        e.preventDefault();
        const keys = Array.from(store.selectedKeys);
        if (keys.length > 0) {
          store.copyToClipboard(keys, "copy");
        }
        return;
      }

      if (isMod && e.key === "x") {
        e.preventDefault();
        const keys = Array.from(store.selectedKeys);
        if (keys.length > 0) {
          store.copyToClipboard(keys, "cut");
        }
        return;
      }

      if (isMod && e.key === "v") {
        e.preventDefault();
        if (store.clipboardKeys.length > 0 && store.clipboardOperation) {
          pasteFromClipboard(store.clipboardKeys, store.clipboardOperation);
          if (store.clipboardOperation === "cut") {
            store.clearClipboard();
          }
        }
        return;
      }

      if (isMod && e.key === "f") {
        e.preventDefault();
        store.setSearchOpen(true);
        return;
      }

      if (isMod && e.shiftKey && e.key === "N") {
        e.preventDefault();
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        const keys = Array.from(store.selectedKeys);
        if (keys.length > 0) {
          e.preventDefault();
          bulkDelete(keys);
        }
        return;
      }

      if (e.key === "Escape") {
        store.clearSelection();
        store.setSearchOpen(false);
        return;
      }

      if (e.key === "/" && !isMod) {
        e.preventDefault();
        store.setSearchOpen(true);
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [store, bulkDelete, bulkDownload, pasteFromClipboard]);
}
