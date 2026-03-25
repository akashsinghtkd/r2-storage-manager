"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useFileBrowserStore } from "@/stores/file-browser-store";

export function useBulkOperations() {
  const queryClient = useQueryClient();
  const { currentPrefix, clearSelection } = useFileBrowserStore();

  const bulkDelete = useCallback(
    async (keys: string[]) => {
      try {
        const res = await fetch("/api/r2/objects", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ keys }),
        });
        if (!res.ok) throw new Error("Failed to delete");
        toast.success(`Deleted ${keys.length} item(s)`);
        clearSelection();
        queryClient.invalidateQueries({ queryKey: ["objects", currentPrefix] });
      } catch {
        toast.error("Failed to delete items");
      }
    },
    [queryClient, currentPrefix, clearSelection]
  );

  const bulkMove = useCallback(
    async (keys: string[], destination: string) => {
      try {
        const res = await fetch("/api/r2/object", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "move", keys, destination }),
        });
        if (!res.ok) throw new Error("Failed to move");
        toast.success(`Moved ${keys.length} item(s)`);
        clearSelection();
        queryClient.invalidateQueries({ queryKey: ["objects"] });
      } catch {
        toast.error("Failed to move items");
      }
    },
    [queryClient, clearSelection]
  );

  const bulkDownload = useCallback(async (keys: string[]) => {
    try {
      const res = await fetch("/api/r2/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys }),
      });
      if (!res.ok) throw new Error("Failed to download");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = keys.length === 1 ? (keys[0].split("/").pop() || "download") : "download.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(keys.length === 1 ? "Downloaded file" : `Downloaded ${keys.length} files as ZIP`);
    } catch {
      toast.error("Failed to download");
    }
  }, []);

  const pasteFromClipboard = useCallback(
    async (clipboardKeys: string[], operation: "copy" | "cut") => {
      try {
        const action = operation === "cut" ? "move" : "move";
        const res = await fetch("/api/r2/object", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            keys: clipboardKeys,
            destination: currentPrefix,
          }),
        });
        if (!res.ok) throw new Error("Failed to paste");

        if (operation === "copy") {
          toast.success(`Copied ${clipboardKeys.length} item(s)`);
        } else {
          toast.success(`Moved ${clipboardKeys.length} item(s)`);
        }

        queryClient.invalidateQueries({ queryKey: ["objects"] });
      } catch {
        toast.error("Failed to paste items");
      }
    },
    [queryClient, currentPrefix]
  );

  return { bulkDelete, bulkMove, bulkDownload, pasteFromClipboard };
}
