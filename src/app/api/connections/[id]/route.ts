import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser, getConnection, updateConnection, deleteConnection, setActiveConnection } from "@/lib/auth";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    if (body.setActive) {
      await setActiveConnection(user.id, id);
      return NextResponse.json({ success: true });
    }

    const updated = await updateConnection(user.id, id, body);
    if (!updated) return NextResponse.json({ error: "Connection not found" }, { status: 404 });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      bucketName: updated.bucketName,
      isActive: updated.isActive,
    });
  } catch {
    return NextResponse.json({ error: "Failed to update connection" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { id } = await params;
    const connection = await getConnection(user.id, id);
    if (!connection) return NextResponse.json({ error: "Connection not found" }, { status: 404 });

    await deleteConnection(user.id, id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete connection" }, { status: 500 });
  }
}
