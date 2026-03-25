import { NextResponse } from "next/server";
import { getStorageAnalytics } from "@/lib/r2-operations";
import { getUserR2Context } from "@/lib/user-r2";

export async function GET() {
  try {
    const ctx = await getUserR2Context();
    const analytics = await getStorageAnalytics(ctx);
    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to get analytics" }, { status: 500 });
  }
}
