import { NextRequest, NextResponse } from "next/server";
import { putObject } from "@/lib/r2-operations";
import { resolveR2Context } from "@/lib/user-r2";
import { getMimeType } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const ctx = await resolveR2Context(request);
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const prefix = (formData.get("prefix") as string) || "";

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const results = [];

    for (const file of files) {
      const relativePath = (formData.get(`path_${file.name}`) as string) || file.name;
      const key = prefix ? `${prefix}${relativePath}` : relativePath;
      const buffer = Buffer.from(await file.arrayBuffer());
      const contentType = file.type || getMimeType(file.name);

      await putObject(ctx, key, buffer, contentType);

      results.push({
        key,
        name: file.name,
        size: file.size,
        contentType,
      });
    }

    return NextResponse.json({ success: true, uploaded: results });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 });
  }
}
