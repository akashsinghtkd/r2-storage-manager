import { NextRequest, NextResponse } from "next/server";
import { getObject } from "@/lib/r2-operations";
import { resolveR2Context } from "@/lib/user-r2";
import JSZip from "jszip";

export async function POST(request: NextRequest) {
  try {
    const ctx = await resolveR2Context(request);
    const { keys } = (await request.json()) as { keys: string[] };

    if (!keys || keys.length === 0) {
      return NextResponse.json({ error: "No keys provided" }, { status: 400 });
    }

    if (keys.length === 1) {
      const response = await getObject(ctx, keys[0]);
      const body = await response.Body?.transformToByteArray();
      if (!body) {
        return NextResponse.json({ error: "Empty file" }, { status: 404 });
      }
      const fileName = keys[0].split("/").pop() || "download";
      return new NextResponse(Buffer.from(body) as unknown as BodyInit, {
        headers: {
          "Content-Type": response.ContentType || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${fileName}"`,
        },
      });
    }

    const zip = new JSZip();

    for (const key of keys) {
      try {
        const response = await getObject(ctx, key);
        const body = await response.Body?.transformToByteArray();
        if (body) {
          const fileName = key.split("/").pop() || key;
          zip.file(fileName, body);
        }
      } catch {
        console.error(`Failed to fetch ${key} for zip`);
      }
    }

    const zipBuffer = await zip.generateAsync({ type: "uint8array" });

    return new NextResponse(Buffer.from(zipBuffer) as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="download.zip"`,
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Failed to download" }, { status: 500 });
  }
}
