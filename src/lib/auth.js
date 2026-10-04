import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function signJwt(payload, opts = {}) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET");
  return jwt.sign(payload, secret, { expiresIn: "12h", ...opts });
}

export async function verifyJwt(token) {
  try { return jwt.verify(token, process.env.JWT_SECRET); }
  catch { return null; }
}

export async function requireAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return null;
  const decoded = await verifyJwt(token);
  if (!decoded || !decoded.isAdmin) return null;
  return decoded;
}
