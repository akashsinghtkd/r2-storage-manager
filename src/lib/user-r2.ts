import { createR2Client, type R2Context } from "./s3-client";
import { getCurrentUser, getActiveConnection } from "./auth";

export async function getUserR2Context(): Promise<R2Context> {
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
