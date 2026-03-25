import { useAuthStore } from "@/stores/auth-store";

/**
 * Fetch wrapper that automatically attaches guest R2 credentials as headers
 * when the user is in guest mode. For authenticated users, the session cookie
 * is sent automatically by the browser.
 */
export function apiFetch(url: string, options?: RequestInit): Promise<Response> {
  const { guestCredentials } = useAuthStore.getState();
  const headers = new Headers(options?.headers);

  if (guestCredentials) {
    headers.set("x-r2-account-id", guestCredentials.accountId);
    headers.set("x-r2-access-key-id", guestCredentials.accessKeyId);
    headers.set("x-r2-secret-access-key", guestCredentials.secretAccessKey);
    headers.set("x-r2-bucket-name", guestCredentials.bucketName);
    if (guestCredentials.publicUrl) {
      headers.set("x-r2-public-url", guestCredentials.publicUrl);
    }
  }

  return fetch(url, { ...options, headers });
}
