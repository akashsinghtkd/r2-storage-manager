import {
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  CopyObjectCommand,
  HeadObjectCommand,
  type _Object,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { R2Context } from "./s3-client";
import { type R2Object, type ListResponse, type StorageAnalytics } from "@/types/r2";
import { getNameFromKey, getContentTypeCategory } from "./utils";

function mapObject(obj: _Object, contentType?: string): R2Object {
  const key = obj.Key || "";
  return {
    key,
    name: getNameFromKey(key),
    size: obj.Size || 0,
    lastModified: obj.LastModified?.toISOString() || "",
    etag: obj.ETag || "",
    contentType: contentType,
    isFolder: key.endsWith("/"),
  };
}

export async function listObjects(
  ctx: R2Context,
  prefix: string = "",
  delimiter: string = "/",
  maxKeys: number = 1000,
  continuationToken?: string
): Promise<ListResponse> {
  const command = new ListObjectsV2Command({
    Bucket: ctx.bucket,
    Prefix: prefix,
    Delimiter: delimiter,
    MaxKeys: maxKeys,
    ...(continuationToken ? { ContinuationToken: continuationToken } : {}),
  });

  const response = await ctx.client.send(command);

  const objects: R2Object[] = (response.Contents || [])
    .filter((obj) => obj.Key !== prefix)
    .map((obj) => mapObject(obj));

  const folders: R2Object[] = (response.CommonPrefixes || []).map((cp) => ({
    key: cp.Prefix || "",
    name: getNameFromKey(cp.Prefix || ""),
    size: 0,
    lastModified: "",
    isFolder: true,
  }));

  return {
    objects,
    folders,
    prefix,
    isTruncated: response.IsTruncated || false,
    nextContinuationToken: response.NextContinuationToken,
  };
}

export async function headObject(ctx: R2Context, key: string) {
  const command = new HeadObjectCommand({ Bucket: ctx.bucket, Key: key });
  return ctx.client.send(command);
}

export async function getObject(ctx: R2Context, key: string) {
  const command = new GetObjectCommand({ Bucket: ctx.bucket, Key: key });
  return ctx.client.send(command);
}

export async function putObject(
  ctx: R2Context,
  key: string,
  body: Buffer | Uint8Array | ReadableStream | string,
  contentType: string
) {
  const command = new PutObjectCommand({
    Bucket: ctx.bucket,
    Key: key,
    Body: body as PutObjectCommand["input"]["Body"],
    ContentType: contentType,
  });
  return ctx.client.send(command);
}

export async function deleteObject(ctx: R2Context, key: string) {
  const command = new DeleteObjectCommand({ Bucket: ctx.bucket, Key: key });
  return ctx.client.send(command);
}

export async function deleteObjects(ctx: R2Context, keys: string[]) {
  const batches: string[][] = [];
  for (let i = 0; i < keys.length; i += 1000) {
    batches.push(keys.slice(i, i + 1000));
  }

  for (const batch of batches) {
    const command = new DeleteObjectsCommand({
      Bucket: ctx.bucket,
      Delete: {
        Objects: batch.map((key) => ({ Key: key })),
        Quiet: true,
      },
    });
    await ctx.client.send(command);
  }
}

export async function copyObject(ctx: R2Context, sourceKey: string, destinationKey: string) {
  const command = new CopyObjectCommand({
    Bucket: ctx.bucket,
    CopySource: `${ctx.bucket}/${sourceKey}`,
    Key: destinationKey,
  });
  return ctx.client.send(command);
}

export async function createFolder(ctx: R2Context, prefix: string) {
  const folderKey = prefix.endsWith("/") ? prefix : `${prefix}/`;
  return putObject(ctx, folderKey, "", "application/x-directory");
}

export async function deleteFolderRecursive(ctx: R2Context, prefix: string) {
  const folderPrefix = prefix.endsWith("/") ? prefix : `${prefix}/`;
  const allKeys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await listObjects(ctx, folderPrefix, "", 1000, continuationToken);
    allKeys.push(...response.objects.map((obj) => obj.key));
    continuationToken = response.isTruncated ? response.nextContinuationToken : undefined;
  } while (continuationToken);

  allKeys.push(folderPrefix);

  if (allKeys.length > 0) {
    await deleteObjects(ctx, allKeys);
  }
}

export async function renameObject(ctx: R2Context, oldKey: string, newKey: string) {
  await copyObject(ctx, oldKey, newKey);
  await deleteObject(ctx, oldKey);
}

export async function renameFolderRecursive(ctx: R2Context, oldPrefix: string, newPrefix: string) {
  const oldFolder = oldPrefix.endsWith("/") ? oldPrefix : `${oldPrefix}/`;
  const newFolder = newPrefix.endsWith("/") ? newPrefix : `${newPrefix}/`;

  const allKeys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await listObjects(ctx, oldFolder, "", 1000, continuationToken);
    allKeys.push(...response.objects.map((obj) => obj.key));
    continuationToken = response.isTruncated ? response.nextContinuationToken : undefined;
  } while (continuationToken);

  for (const key of allKeys) {
    const newKey = newFolder + key.slice(oldFolder.length);
    await copyObject(ctx, key, newKey);
  }

  await createFolder(ctx, newFolder);
  allKeys.push(oldFolder);
  await deleteObjects(ctx, allKeys);
}

export async function moveObjects(ctx: R2Context, keys: string[], destinationPrefix: string) {
  const destPrefix = destinationPrefix.endsWith("/") ? destinationPrefix : `${destinationPrefix}/`;

  for (const key of keys) {
    const name = getNameFromKey(key);
    const isFolder = key.endsWith("/");

    if (isFolder) {
      await renameFolderRecursive(ctx, key, `${destPrefix}${name}/`);
    } else {
      await copyObject(ctx, key, `${destPrefix}${name}`);
      await deleteObject(ctx, key);
    }
  }
}

export async function getPresignedUrl(ctx: R2Context, key: string, expiresIn: number = 3600) {
  const command = new GetObjectCommand({ Bucket: ctx.bucket, Key: key });
  return getSignedUrl(ctx.client, command, { expiresIn });
}

export async function searchObjects(ctx: R2Context, query: string, maxResults: number = 100): Promise<R2Object[]> {
  const results: R2Object[] = [];
  let continuationToken: string | undefined;
  const lowerQuery = query.toLowerCase();

  do {
    const response = await listObjects(ctx, "", "", 1000, continuationToken);
    const matches = response.objects.filter((obj) =>
      obj.name.toLowerCase().includes(lowerQuery) || obj.key.toLowerCase().includes(lowerQuery)
    );
    results.push(...matches);
    if (results.length >= maxResults) break;
    continuationToken = response.isTruncated ? response.nextContinuationToken : undefined;
  } while (continuationToken);

  return results.slice(0, maxResults);
}

export async function getStorageAnalytics(ctx: R2Context): Promise<StorageAnalytics> {
  const allObjects: R2Object[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await listObjects(ctx, "", "", 1000, continuationToken);
    allObjects.push(...response.objects.filter((obj) => !obj.isFolder));
    continuationToken = response.isTruncated ? response.nextContinuationToken : undefined;
  } while (continuationToken);

  const totalSize = allObjects.reduce((sum, obj) => sum + obj.size, 0);

  const typeMap = new Map<string, { count: number; size: number }>();
  for (const obj of allObjects) {
    const category = getContentTypeCategory(obj.contentType || "application/octet-stream");
    const existing = typeMap.get(category) || { count: 0, size: 0 };
    typeMap.set(category, { count: existing.count + 1, size: existing.size + obj.size });
  }

  const typeBreakdown = Array.from(typeMap.entries()).map(([type, data]) => ({
    type,
    ...data,
  }));

  const topFiles = [...allObjects]
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)
    .map((obj) => ({ key: obj.key, size: obj.size, contentType: obj.contentType || "unknown" }));

  return {
    totalObjects: allObjects.length,
    totalSize,
    typeBreakdown,
    topFiles,
  };
}
