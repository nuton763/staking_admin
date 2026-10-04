import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { signJwt } from "@/lib/auth";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await dbConnect();
  const { email, password } = await req.json();
  const cc = await User.find();
  const user = await User.findOne({ email });
  if (!user) return new Response(JSON.stringify({ message:"Invalid Emails" }), { status: 401 });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok || !user.isAdmin) return new Response(JSON.stringify({ message:"Invalid credentials" }), { status: 401 });

  const token = await signJwt({ id: String(user._id), email: user.email, isAdmin: true }, { expiresIn: "12h" });
  const cs = await cookies();
  cs.set("admin_token", token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60*60*12
  });
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
