import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

export function getContentTypeCategory(contentType: string): string {
  if (contentType.startsWith("image/")) return "Images";
  if (contentType.startsWith("video/")) return "Videos";
  if (contentType.startsWith("audio/")) return "Audio";
  if (contentType.startsWith("text/") || contentType.includes("json") || contentType.includes("xml") || contentType.includes("javascript"))
    return "Code/Text";
  if (contentType.includes("pdf")) return "Documents";
  if (contentType.includes("zip") || contentType.includes("tar") || contentType.includes("gzip") || contentType.includes("rar"))
    return "Archives";
  return "Other";
}

export function isImageFile(name: string): boolean {
  const ext = getFileExtension(name);
  return ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico", "avif"].includes(ext);
}

export function isVideoFile(name: string): boolean {
  const ext = getFileExtension(name);
  return ["mp4", "webm", "ogg", "mov", "avi", "mkv"].includes(ext);
}

export function isAudioFile(name: string): boolean {
  const ext = getFileExtension(name);
  return ["mp3", "wav", "ogg", "flac", "aac", "m4a"].includes(ext);
}

export function isPdfFile(name: string): boolean {
  return getFileExtension(name) === "pdf";
}

export function isTextFile(name: string): boolean {
  const ext = getFileExtension(name);
  return [
    "txt", "md", "json", "js", "ts", "tsx", "jsx", "css", "html", "xml",
    "yaml", "yml", "toml", "ini", "cfg", "conf", "sh", "bash", "py",
    "rb", "go", "rs", "java", "c", "cpp", "h", "hpp", "sql", "env",
    "csv", "log", "gitignore", "dockerfile", "makefile",
  ].includes(ext);
}

export function getMonacoLanguage(name: string): string {
  const ext = getFileExtension(name);
  const map: Record<string, string> = {
    js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript",
    json: "json", html: "html", css: "css", md: "markdown", xml: "xml",
    yaml: "yaml", yml: "yaml", py: "python", rb: "ruby", go: "go",
    rs: "rust", java: "java", c: "c", cpp: "cpp", sql: "sql",
    sh: "shell", bash: "shell", dockerfile: "dockerfile",
  };
  return map[ext] || "plaintext";
}

export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename);
  const map: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif",
    webp: "image/webp", svg: "image/svg+xml", bmp: "image/bmp", ico: "image/x-icon",
    mp4: "video/mp4", webm: "video/webm", ogg: "video/ogg", mov: "video/quicktime",
    mp3: "audio/mpeg", wav: "audio/wav", flac: "audio/flac", aac: "audio/aac",
    pdf: "application/pdf", json: "application/json", xml: "application/xml",
    zip: "application/zip", gz: "application/gzip", tar: "application/x-tar",
    js: "text/javascript", ts: "text/typescript", css: "text/css", html: "text/html",
    txt: "text/plain", md: "text/markdown", csv: "text/csv",
  };
  return map[ext] || "application/octet-stream";
}

export function getNameFromKey(key: string): string {
  const trimmed = key.endsWith("/") ? key.slice(0, -1) : key;
  const parts = trimmed.split("/");
  return parts[parts.length - 1] || key;
}

export function getParentPrefix(key: string): string {
  const trimmed = key.endsWith("/") ? key.slice(0, -1) : key;
  const lastSlash = trimmed.lastIndexOf("/");
  return lastSlash >= 0 ? trimmed.substring(0, lastSlash + 1) : "";
}

export function getFileColor(name: string): { bg: string; text: string; icon: string } {
  const ext = getFileExtension(name);
  const map: Record<string, { bg: string; text: string; icon: string }> = {
    // Images
    jpg: { bg: "rgba(168, 85, 247, 0.12)", text: "#a855f7", icon: "#a855f7" },
    jpeg: { bg: "rgba(168, 85, 247, 0.12)", text: "#a855f7", icon: "#a855f7" },
    png: { bg: "rgba(168, 85, 247, 0.12)", text: "#a855f7", icon: "#a855f7" },
    gif: { bg: "rgba(168, 85, 247, 0.12)", text: "#a855f7", icon: "#a855f7" },
    webp: { bg: "rgba(168, 85, 247, 0.12)", text: "#a855f7", icon: "#a855f7" },
    svg: { bg: "rgba(168, 85, 247, 0.12)", text: "#a855f7", icon: "#a855f7" },
    // Videos
    mp4: { bg: "rgba(236, 72, 153, 0.12)", text: "#ec4899", icon: "#ec4899" },
    webm: { bg: "rgba(236, 72, 153, 0.12)", text: "#ec4899", icon: "#ec4899" },
    mov: { bg: "rgba(236, 72, 153, 0.12)", text: "#ec4899", icon: "#ec4899" },
    // Audio
    mp3: { bg: "rgba(20, 184, 166, 0.12)", text: "#14b8a6", icon: "#14b8a6" },
    wav: { bg: "rgba(20, 184, 166, 0.12)", text: "#14b8a6", icon: "#14b8a6" },
    flac: { bg: "rgba(20, 184, 166, 0.12)", text: "#14b8a6", icon: "#14b8a6" },
    // Code
    js: { bg: "rgba(234, 179, 8, 0.12)", text: "#eab308", icon: "#eab308" },
    ts: { bg: "rgba(59, 130, 246, 0.12)", text: "#3b82f6", icon: "#3b82f6" },
    tsx: { bg: "rgba(59, 130, 246, 0.12)", text: "#3b82f6", icon: "#3b82f6" },
    jsx: { bg: "rgba(234, 179, 8, 0.12)", text: "#eab308", icon: "#eab308" },
    py: { bg: "rgba(34, 197, 94, 0.12)", text: "#22c55e", icon: "#22c55e" },
    json: { bg: "rgba(234, 179, 8, 0.12)", text: "#eab308", icon: "#eab308" },
    css: { bg: "rgba(59, 130, 246, 0.12)", text: "#3b82f6", icon: "#3b82f6" },
    html: { bg: "rgba(249, 115, 22, 0.12)", text: "#f97316", icon: "#f97316" },
    // Documents
    pdf: { bg: "rgba(239, 68, 68, 0.12)", text: "#ef4444", icon: "#ef4444" },
    md: { bg: "rgba(100, 116, 139, 0.12)", text: "#64748b", icon: "#64748b" },
    txt: { bg: "rgba(100, 116, 139, 0.12)", text: "#64748b", icon: "#64748b" },
    // Archives
    zip: { bg: "rgba(249, 115, 22, 0.12)", text: "#f97316", icon: "#f97316" },
    tar: { bg: "rgba(249, 115, 22, 0.12)", text: "#f97316", icon: "#f97316" },
    gz: { bg: "rgba(249, 115, 22, 0.12)", text: "#f97316", icon: "#f97316" },
  };
  return map[ext] || { bg: "rgba(100, 116, 139, 0.12)", text: "#64748b", icon: "#64748b" };
}
