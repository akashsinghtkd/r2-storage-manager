import { NextRequest, NextResponse } from "next/server";
import { createFolder, deleteFolderRecursive } from "@/lib/r2-operations";
import { resolveR2Context } from "@/lib/user-r2";

export async function POST(request: NextRequest) {
  try {
    const ctx = await resolveR2Context(request);
    const { prefix } = (await request.json()) as { prefix: string };

    if (!prefix) {
      return NextResponse.json({ error: "Prefix is required" }, { status: 400 });
    }

    await createFolder(ctx, prefix);
    return NextResponse.json({ success: true, folder: prefix });
  } catch (error) {
    console.error("Create folder error:", error);
    return NextResponse.json({ error: "Failed to create folder" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const ctx = await resolveR2Context(request);
    const { prefix } = (await request.json()) as { prefix: string };

    if (!prefix) {
      return NextResponse.json({ error: "Prefix is required" }, { status: 400 });
    }

    await deleteFolderRecursive(ctx, prefix);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete folder error:", error);
    return NextResponse.json({ error: "Failed to delete folder" }, { status: 500 });
  }
}
