import { NextRequest, NextResponse } from "next/server";
import { searchObjects } from "@/lib/r2-operations";
import { resolveR2Context } from "@/lib/user-r2";

export async function GET(request: NextRequest) {
  try {
    const ctx = await resolveR2Context(request);
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const maxResults = parseInt(searchParams.get("maxResults") || "100");

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const results = await searchObjects(ctx, query, maxResults);
    return NextResponse.json({ results, query });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Failed to search objects" }, { status: 500 });
  }
}
