import { NextRequest, NextResponse } from "next/server";
import { listObjects, deleteObject, deleteObjects } from "@/lib/r2-operations";
import { resolveR2Context } from "@/lib/user-r2";

export async function GET(request: NextRequest) {
  try {
    const ctx = await resolveR2Context(request);
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get("prefix") || "";
    const delimiter = searchParams.get("delimiter") ?? "/";
    const maxKeys = parseInt(searchParams.get("maxKeys") || "1000");
    const continuationToken = searchParams.get("continuationToken") || undefined;

    const result = await listObjects(ctx, prefix, delimiter, maxKeys, continuationToken);
    return NextResponse.json(result);
  } catch (error) {
    console.error("List objects error:", error);
    const message = error instanceof Error ? error.message : "Failed to list objects";
    if (message === "Not authenticated") return NextResponse.json({ error: message }, { status: 401 });
    if (message === "No R2 bucket connected") return NextResponse.json({ error: message }, { status: 400 });
    return NextResponse.json({ error: "Failed to list objects" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ctx = await resolveR2Context(request);
    const body = await request.json();
    const { keys } = body as { keys: string[] };

    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return NextResponse.json({ error: "No keys provided" }, { status: 400 });
    }

    if (keys.length === 1) {
      await deleteObject(ctx, keys[0]);
    } else {
      await deleteObjects(ctx, keys);
    }

    return NextResponse.json({ success: true, deleted: keys.length });
  } catch (error) {
    console.error("Delete objects error:", error);
    return NextResponse.json({ error: "Failed to delete objects" }, { status: 500 });
  }
}
