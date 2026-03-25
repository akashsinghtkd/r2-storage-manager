import { NextResponse, type NextRequest } from "next/server";
import { getUserByOAuth, createUser, createOAuthIndex, createSession, setSessionCookie, getUserByEmail } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    if (!code) return NextResponse.redirect(new URL("/login?error=no_code", request.url));

    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/google/callback`;

    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) return NextResponse.redirect(new URL("/login?error=token_failed", request.url));

    // Get user info
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userRes.json();

    // Find or create user
    let user = await getUserByOAuth("google", googleUser.id);

    if (!user) {
      // Check if email already exists (link accounts)
      user = await getUserByEmail(googleUser.email);
      if (!user) {
        user = await createUser({
          name: googleUser.name,
          email: googleUser.email,
          oauthProvider: "google",
          oauthId: googleUser.id,
          avatar: googleUser.picture,
        });
      }
      await createOAuthIndex("google", googleUser.id, user.id);
    }

    const session = await createSession(user.id);
    await setSessionCookie(session.token);

    return NextResponse.redirect(new URL("/", request.url));
  } catch {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }
}
