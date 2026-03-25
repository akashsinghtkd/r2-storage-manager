import { NextRequest, NextResponse } from "next/server";
import { getStorageAnalytics } from "@/lib/r2-operations";
import { resolveR2Context } from "@/lib/user-r2";

export async function GET(request: NextRequest) {
  try {
    const ctx = await resolveR2Context(request);
    const analytics = await getStorageAnalytics(ctx);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to get analytics" }, { status: 500 });
  }
}
