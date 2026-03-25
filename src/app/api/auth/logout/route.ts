import { NextResponse } from "next/server";
import { getSessionFromCookie, deleteSession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const session = await getSessionFromCookie();
    if (session) {
      await deleteSession(session.token);
    }
    const cookieStore = await cookies();
    cookieStore.delete("session");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
