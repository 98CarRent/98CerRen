import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import db from "./db";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "98CarRent_Super_Secret_Change_Me_2026"
);
const COOKIE = "carent_admin";

export interface AdminSession {
  id: number;
  username: string;
  role: string;
}

export async function verifyAdmin(): Promise<AdminSession | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload.id as number,
      username: payload.username as string,
      role: (payload.role as string) || "admin",
    };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AdminSession> {
  const admin = await verifyAdmin();
  if (!admin) throw new Error("Unauthorized");
  return admin;
}

export async function loginAdmin(username: string, password: string): Promise<boolean> {
  const user = await db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(username) as
    | { id: number; password_hash: string; role: string }
    | undefined;
  if (!user) return false;
  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) return false;
  const token = await new SignJWT({
    id: user.id,
    username,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return true;
}

export async function logoutAdmin() {
  const store = await cookies();
  store.delete(COOKIE);
}