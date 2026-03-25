export interface R2Object {
  key: string;
  name: string;
  size: number;
  lastModified: string;
  etag?: string;
  contentType?: string;
  isFolder: boolean;
}

export interface ListResponse {
  objects: R2Object[];
  folders: R2Object[];
  prefix: string;
  isTruncated: boolean;
  nextContinuationToken?: string;
}

export interface UploadProgress {
  id: string;
  fileName: string;
  progress: number;
  total: number;
  status: "pending" | "uploading" | "completed" | "error" | "cancelled";
  error?: string;
  abortController?: AbortController;
}

export interface StorageAnalytics {
  totalObjects: number;
  totalSize: number;
  typeBreakdown: { type: string; count: number; size: number }[];
  topFiles: { key: string; size: number; contentType: string }[];
}

export interface FileVersion {
  versionId: string;
  key: string;
  size: number;
  lastModified: string;
  isLatest: boolean;
}

export type SortField = "name" | "size" | "lastModified" | "type";
export type SortDirection = "asc" | "desc";
export type ViewMode = "grid" | "list";
export type ClipboardOperation = "copy" | "cut";
