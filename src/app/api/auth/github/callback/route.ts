import { NextResponse, type NextRequest } from "next/server";
import { getUserByOAuth, createUser, createOAuthIndex, createSession, setSessionCookie, getUserByEmail } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    if (!code) return NextResponse.redirect(new URL("/login?error=no_code", request.url));

    const clientId = process.env.GITHUB_CLIENT_ID!;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET!;

    // Exchange code for token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) return NextResponse.redirect(new URL("/login?error=token_failed", request.url));

    // Get user info
    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const githubUser = await userRes.json();

    // Get primary email
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const emails = await emailsRes.json();
    const primaryEmail = emails.find((e: { primary: boolean }) => e.primary)?.email || githubUser.email;

    // Find or create user
    let user = await getUserByOAuth("github", String(githubUser.id));

    if (!user) {
      user = await getUserByEmail(primaryEmail);
      if (!user) {
        user = await createUser({
          name: githubUser.name || githubUser.login,
          email: primaryEmail,
          oauthProvider: "github",
          oauthId: String(githubUser.id),
          avatar: githubUser.avatar_url,
        });
      }
      await createOAuthIndex("github", String(githubUser.id), user.id);
    }

    const session = await createSession(user.id);
    await setSessionCookie(session.token);

    return NextResponse.redirect(new URL("/", request.url));
  } catch {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }
}
