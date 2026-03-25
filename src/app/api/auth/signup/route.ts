import { NextResponse } from "next/server";
import { createUser, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const user = await createUser({ name, email, password });
    const session = await createSession(user.id);
    await setSessionCookie(session.token);

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, avatar: user.avatar },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Signup failed";
    const status = message === "Email already registered" ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
