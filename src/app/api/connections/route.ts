import { NextResponse } from "next/server";
import { getCurrentUser, getConnections, createConnection } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const connections = await getConnections(user.id);
    return NextResponse.json(connections.map((c) => ({
      id: c.id,
      name: c.name,
      accountId: c.accountId,
      bucketName: c.bucketName,
      publicUrl: c.publicUrl,
      isActive: c.isActive,
      createdAt: c.createdAt,
    })));
  } catch {
    return NextResponse.json({ error: "Failed to get connections" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { name, accountId, accessKeyId, secretAccessKey, bucketName, publicUrl } = await request.json();

    if (!name || !accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const connection = await createConnection(user.id, {
      name, accountId, accessKeyId, secretAccessKey, bucketName, publicUrl,
    });

    return NextResponse.json({
      id: connection.id,
      name: connection.name,
      bucketName: connection.bucketName,
      isActive: connection.isActive,
      createdAt: connection.createdAt,
    });
  } catch {
    return NextResponse.json({ error: "Failed to create connection" }, { status: 500 });
  }
}
