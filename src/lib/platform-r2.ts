import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

let platformClient: S3Client | null = null;

function getPlatformClient(): S3Client {
  if (!platformClient) {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error("Missing platform R2 credentials in env");
    }
    platformClient = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }
  return platformClient;
}

function getPlatformBucket(): string {
  const bucket = process.env.R2_BUCKET_NAME;
  if (!bucket) throw new Error("Missing R2_BUCKET_NAME in env");
  return bucket;
}

export async function dbGet<T>(key: string): Promise<T | null> {
  try {
    const client = getPlatformClient();
    const res = await client.send(new GetObjectCommand({
      Bucket: getPlatformBucket(),
      Key: `platform-db/${key}`,
    }));
    const body = await res.Body?.transformToString();
    if (!body) return null;
    return JSON.parse(body) as T;
  } catch (err: unknown) {
    const code = (err as { name?: string }).name;
    if (code === "NoSuchKey" || code === "NotFound") return null;
    throw err;
  }
}

export async function dbPut(key: string, data: unknown): Promise<void> {
  const client = getPlatformClient();
  await client.send(new PutObjectCommand({
    Bucket: getPlatformBucket(),
    Key: `platform-db/${key}`,
    Body: JSON.stringify(data),
    ContentType: "application/json",
  }));
}

export async function dbDelete(key: string): Promise<void> {
  const client = getPlatformClient();
  await client.send(new DeleteObjectCommand({
    Bucket: getPlatformBucket(),
    Key: `platform-db/${key}`,
  }));
}

export async function dbList(prefix: string): Promise<string[]> {
  const client = getPlatformClient();
  const fullPrefix = `platform-db/${prefix}`;
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const res = await client.send(new ListObjectsV2Command({
      Bucket: getPlatformBucket(),
      Prefix: fullPrefix,
      MaxKeys: 1000,
      ...(continuationToken ? { ContinuationToken: continuationToken } : {}),
    }));
    for (const obj of res.Contents || []) {
      if (obj.Key) keys.push(obj.Key.replace("platform-db/", ""));
    }
    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
}
