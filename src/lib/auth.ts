import bcrypt from "bcryptjs";
import { dbGet, dbPut, dbDelete, dbList } from "./platform-r2";
import { cookies } from "next/headers";

// ── Types ──

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  oauthProvider?: "google" | "github";
  oauthId?: string;
  avatar?: string;
  createdAt: string;
}

export interface Session {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface R2Connection {
  id: string;
  userId: string;
  name: string;
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
  createdAt: string;
  isActive: boolean;
}

// ── Password ──

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ── Users ──

export async function createUser(data: {
  name: string;
  email: string;
  password?: string;
  oauthProvider?: "google" | "github";
  oauthId?: string;
  avatar?: string;
}): Promise<User> {
  const existing = await getUserByEmail(data.email);
  if (existing) throw new Error("Email already registered");

  const id = crypto.randomUUID();
  const user: User = {
    id,
    name: data.name,
    email: data.email.toLowerCase(),
    passwordHash: data.password ? await hashPassword(data.password) : undefined,
    oauthProvider: data.oauthProvider,
    oauthId: data.oauthId,
    avatar: data.avatar,
    createdAt: new Date().toISOString(),
  };

  await dbPut(`users/${id}.json`, user);
  await dbPut(`users-by-email/${user.email}.json`, { userId: id });

  return user;
}

export async function getUserById(id: string): Promise<User | null> {
  return dbGet<User>(`users/${id}.json`);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const index = await dbGet<{ userId: string }>(`users-by-email/${email.toLowerCase()}.json`);
  if (!index) return null;
  return getUserById(index.userId);
}

export async function getUserByOAuth(provider: string, oauthId: string): Promise<User | null> {
  const index = await dbGet<{ userId: string }>(`users-by-oauth/${provider}_${oauthId}.json`);
  if (!index) return null;
  return getUserById(index.userId);
}

export async function createOAuthIndex(provider: string, oauthId: string, userId: string): Promise<void> {
  await dbPut(`users-by-oauth/${provider}_${oauthId}.json`, { userId });
}

// ── Sessions ──

export async function createSession(userId: string): Promise<Session> {
  const token = crypto.randomUUID();
  const session: Session = {
    token,
    userId,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
  };
  await dbPut(`sessions/${token}.json`, session);
  return session;
}

export async function getSession(token: string): Promise<Session | null> {
  const session = await dbGet<Session>(`sessions/${token}.json`);
  if (!session) return null;
  if (new Date(session.expiresAt) < new Date()) {
    await dbDelete(`sessions/${token}.json`);
    return null;
  }
  return session;
}

export async function deleteSession(token: string): Promise<void> {
  await dbDelete(`sessions/${token}.json`);
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60,
  });
}

export async function getSessionFromCookie(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return getSession(token);
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSessionFromCookie();
  if (!session) return null;
  return getUserById(session.userId);
}

// ── R2 Connections ──

export async function getConnections(userId: string): Promise<R2Connection[]> {
  const keys = await dbList(`connections/${userId}/`);
  const connections: R2Connection[] = [];
  for (const key of keys) {
    const conn = await dbGet<R2Connection>(key);
    if (conn) connections.push(conn);
  }
  return connections.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getConnection(userId: string, connectionId: string): Promise<R2Connection | null> {
  return dbGet<R2Connection>(`connections/${userId}/${connectionId}.json`);
}

export async function getActiveConnection(userId: string): Promise<R2Connection | null> {
  const connections = await getConnections(userId);
  return connections.find((c) => c.isActive) || connections[0] || null;
}

export async function createConnection(userId: string, data: {
  name: string;
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicUrl?: string;
}): Promise<R2Connection> {
  const connections = await getConnections(userId);
  const id = crypto.randomUUID();
  const connection: R2Connection = {
    id,
    userId,
    ...data,
    createdAt: new Date().toISOString(),
    isActive: connections.length === 0, // first connection is active by default
  };
  await dbPut(`connections/${userId}/${id}.json`, connection);
  return connection;
}

export async function updateConnection(userId: string, connectionId: string, data: Partial<R2Connection>): Promise<R2Connection | null> {
  const connection = await getConnection(userId, connectionId);
  if (!connection) return null;
  const updated = { ...connection, ...data, id: connectionId, userId };
  await dbPut(`connections/${userId}/${connectionId}.json`, updated);
  return updated;
}

export async function deleteConnection(userId: string, connectionId: string): Promise<void> {
  await dbDelete(`connections/${userId}/${connectionId}.json`);
}

export async function setActiveConnection(userId: string, connectionId: string): Promise<void> {
  const connections = await getConnections(userId);
  for (const conn of connections) {
    if (conn.isActive && conn.id !== connectionId) {
      await updateConnection(userId, conn.id, { isActive: false });
    }
  }
  await updateConnection(userId, connectionId, { isActive: true });
}
