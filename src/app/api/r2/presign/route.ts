import { NextRequest, NextResponse } from "next/server";
import { getPresignedUrl } from "@/lib/r2-operations";
import { getUserR2Context } from "@/lib/user-r2";

export async function POST(request: NextRequest) {
  try {
    const ctx = await getUserR2Context();
    const { key, expiresIn } = (await request.json()) as {
      key: string;
      expiresIn?: number;
    };

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 });
    }

    const url = await getPresignedUrl(ctx, key, expiresIn || 3600);
    return NextResponse.json({ url, expiresIn: expiresIn || 3600 });
  } catch (error) {
    console.error("Presign error:", error);
    return NextResponse.json({ error: "Failed to generate presigned URL" }, { status: 500 });
  }
}
