import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

export function getContentTypeCategory(contentType: string): string {
  if (contentType.startsWith("image/")) return "Images";
  if (contentType.startsWith("video/")) return "Videos";
  if (contentType.startsWith("audio/")) return "Audio";
  if (contentType.startsWith("text/") || contentType.includes("javascript") || contentType.includes("json") || contentType.includes("xml")) return "Code";
  if (contentType.includes("pdf")) return "Documents";
  if (contentType.includes("zip") || contentType.includes("tar") || contentType.includes("gzip") || contentType.includes("rar")) return "Archives";
  return "Other";
}

export function isImageFile(name: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico|avif|tiff)$/i.test(name);
}

export function isVideoFile(name: string): boolean {
  return /\.(mp4|webm|mov|avi|mkv|flv|wmv|m4v)$/i.test(name);
}

export function isAudioFile(name: string): boolean {
  return /\.(mp3|wav|ogg|flac|aac|wma|m4a)$/i.test(name);
}

export function isPdfFile(name: string): boolean {
  return /\.pdf$/i.test(name);
}

export function isTextFile(name: string): boolean {
  return /\.(txt|md|csv|log|json|xml|yaml|yml|toml|ini|cfg|conf|env|sh|bash|zsh|fish|bat|cmd|ps1|py|js|jsx|ts|tsx|html|htm|css|scss|sass|less|java|kt|swift|go|rs|c|cpp|h|hpp|cs|rb|php|pl|lua|r|sql|graphql|gql|vue|svelte)$/i.test(name);
}

export function getMonacoLanguage(name: string): string {
  const ext = getFileExtension(name);
  const map: Record<string, string> = {
    js: "javascript", jsx: "javascript", ts: "typescript", tsx: "typescript",
    json: "json", html: "html", htm: "html", css: "css", scss: "scss",
    md: "markdown", py: "python", rb: "ruby", go: "go", rs: "rust",
    java: "java", kt: "kotlin", swift: "swift", c: "c", cpp: "cpp",
    cs: "csharp", php: "php", sql: "sql", sh: "shell", bash: "shell",
    yaml: "yaml", yml: "yaml", xml: "xml", svg: "xml", toml: "ini",
    graphql: "graphql", gql: "graphql", vue: "html", svelte: "html",
  };
  return map[ext] || "plaintext";
}

export function getMimeType(filename: string): string {
  const ext = getFileExtension(filename);
  const map: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif",
    webp: "image/webp", svg: "image/svg+xml", bmp: "image/bmp", ico: "image/x-icon",
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", avi: "video/x-msvideo",
    mp3: "audio/mpeg", wav: "audio/wav", ogg: "audio/ogg", flac: "audio/flac",
    pdf: "application/pdf", zip: "application/zip", json: "application/json",
    xml: "application/xml", html: "text/html", css: "text/css", js: "text/javascript",
    txt: "text/plain", csv: "text/csv", md: "text/markdown",
  };
  return map[ext] || "application/octet-stream";
}

export function getFileColor(name: string): { bg: string; icon: string; text: string } {
  let c = "var(--file-doc)";
  if (name.endsWith("/")) c = "var(--file-folder)";
  else if (isImageFile(name)) c = "var(--file-image)";
  else if (isVideoFile(name)) c = "var(--file-video)";
  else if (isAudioFile(name)) c = "var(--file-audio)";
  else if (isPdfFile(name)) c = "var(--file-pdf)";
  else if (isTextFile(name)) c = "var(--file-code)";
  else if (/\.(zip|tar|gz|rar|7z)$/i.test(name)) c = "var(--file-archive)";
  return { bg: `color-mix(in srgb, ${c} 15%, transparent)`, icon: c, text: c };
}

export function getNameFromKey(key: string): string {
  const trimmed = key.endsWith("/") ? key.slice(0, -1) : key;
  return trimmed.split("/").pop() || key;
}

export function getParentPrefix(key: string): string {
  const trimmed = key.endsWith("/") ? key.slice(0, -1) : key;
  const lastSlash = trimmed.lastIndexOf("/");
  return lastSlash >= 0 ? trimmed.substring(0, lastSlash + 1) : "";
}
