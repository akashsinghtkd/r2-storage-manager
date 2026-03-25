import { NextRequest, NextResponse } from "next/server";
import { getObject, headObject, renameObject, renameFolderRecursive, moveObjects } from "@/lib/r2-operations";
import { resolveR2Context } from "@/lib/user-r2";

export async function GET(request: NextRequest) {
  try {
    const ctx = await resolveR2Context(request);
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const metaOnly = searchParams.get("meta") === "true";

    if (metaOnly) {
      const head = await headObject(ctx, key);
      return NextResponse.json({
        key,
        contentType: head.ContentType,
        contentLength: head.ContentLength,
        lastModified: head.LastModified?.toISOString(),
        etag: head.ETag,
      });
    }

    const response = await getObject(ctx, key);
    const body = await response.Body?.transformToByteArray();

    if (!body) {
      return NextResponse.json({ error: "Empty response" }, { status: 404 });
    }

    return new NextResponse(Buffer.from(body) as unknown as BodyInit, {
      headers: {
        "Content-Type": response.ContentType || "application/octet-stream",
        "Content-Length": String(response.ContentLength || body.length),
        "Content-Disposition": `attachment; filename="${key.split("/").pop()}"`,
      },
    });
  } catch (error) {
    console.error("Get object error:", error);
    return NextResponse.json({ error: "Failed to get object" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const ctx = await resolveR2Context(request);
    const body = await request.json();
    const { action, key, newKey, keys, destination } = body as {
      action: "rename" | "move";
      key?: string;
      newKey?: string;
      keys?: string[];
      destination?: string;
    };

    if (action === "rename" && key && newKey) {
      if (key.endsWith("/")) {
        await renameFolderRecursive(ctx, key, newKey);
      } else {
        await renameObject(ctx, key, newKey);
      }
      return NextResponse.json({ success: true });
    }

    if (action === "move" && keys && destination) {
      await moveObjects(ctx, keys, destination);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action or missing parameters" }, { status: 400 });
  } catch (error) {
    console.error("Patch object error:", error);
    return NextResponse.json({ error: "Failed to update object" }, { status: 500 });
  }
}
