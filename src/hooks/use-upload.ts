"use client";

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { UploadProgress } from "@/types/r2";

export function useUpload(prefix: string) {
  const [uploads, setUploads] = useState<UploadProgress[]>([]);
  const queryClient = useQueryClient();

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const newUploads: UploadProgress[] = files.map((file) => ({
        id: `${Date.now()}-${file.name}`,
        fileName: file.name,
        progress: 0,
        total: file.size,
        status: "pending" as const,
      }));

      setUploads((prev) => [...prev, ...newUploads]);

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const upload = newUploads[i];

        setUploads((prev) =>
          prev.map((u) =>
            u.id === upload.id ? { ...u, status: "uploading" as const } : u
          )
        );

        try {
          const formData = new FormData();
          formData.append("files", file);
          formData.append("prefix", prefix);

          const res = await fetch("/api/r2/upload", {
            method: "POST",
            body: formData,
          });

          if (!res.ok) throw new Error("Upload failed");

          setUploads((prev) =>
            prev.map((u) =>
              u.id === upload.id
                ? { ...u, status: "completed" as const, progress: u.total }
                : u
            )
          );

          toast.success(`Uploaded ${file.name}`);
        } catch (error) {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === upload.id
                ? { ...u, status: "error" as const, error: String(error) }
                : u
            )
          );
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["objects", prefix] });
    },
    [prefix, queryClient]
  );

  const clearCompleted = useCallback(() => {
    setUploads((prev) =>
      prev.filter((u) => u.status !== "completed" && u.status !== "error")
    );
  }, []);

  const activeUploads = uploads.filter(
    (u) => u.status === "pending" || u.status === "uploading"
  );

  return { uploads, activeUploads, uploadFiles, clearCompleted };
}
