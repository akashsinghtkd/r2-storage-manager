import { createR2Client, type R2Context } from "./s3-client";
import { getCurrentUser, getActiveConnection } from "./auth";

/**
 * Resolves R2 context from the request.
 * 1. Checks for guest headers (x-r2-*) → builds client from headers (no DB)
 * 2. Falls back to session cookie → looks up user's active connection from DB
 */
export async function resolveR2Context(request: Request): Promise<R2Context> {
  // Guest mode: credentials sent via headers
  const accountId = request.headers.get("x-r2-account-id");
  const accessKeyId = request.headers.get("x-r2-access-key-id");
  const secretAccessKey = request.headers.get("x-r2-secret-access-key");
  const bucketName = request.headers.get("x-r2-bucket-name");

  if (accountId && accessKeyId && secretAccessKey && bucketName) {
    const client = createR2Client(accountId, accessKeyId, secretAccessKey);
    return { client, bucket: bucketName };
  }

  // Authenticated mode: credentials from DB via session
  const user = await getCurrentUser();
  if (!user) throw new Error("Not authenticated");

  const connection = await getActiveConnection(user.id);
  if (!connection) throw new Error("No R2 bucket connected");

  const client = createR2Client(
    connection.accountId,
    connection.accessKeyId,
    connection.secretAccessKey
  );

  return { client, bucket: connection.bucketName };
}
