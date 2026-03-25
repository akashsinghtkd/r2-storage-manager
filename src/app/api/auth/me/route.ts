import { NextResponse } from "next/server";
import { getCurrentUser, getActiveConnection, getConnections } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const connections = await getConnections(user.id);
    const activeConnection = connections.find((c) => c.isActive) || connections[0] || null;

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
      activeConnection: activeConnection ? {
        id: activeConnection.id,
        name: activeConnection.name,
        bucketName: activeConnection.bucketName,
      } : null,
      hasConnections: connections.length > 0,
    });
  } catch {
    return NextResponse.json({ error: "Failed to get user" }, { status: 500 });
  }
}
