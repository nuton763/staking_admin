import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return new Response(JSON.stringify({ message:"Unauthorized" }), { status: 401 });
  await dbConnect();
  const users = await User.find().sort({ createdAt: -1 }).limit(500);
  return new Response(JSON.stringify(users), { status: 200 });
}

export async function POST(req) {
  const admin = await requireAdmin();
  if (!admin) return new Response(JSON.stringify({ message:"Unauthorized" }), { status: 401 });

  await dbConnect();
  const { email, password, isAdmin = false } = await req.json();
  if (!email || !password) return new Response(JSON.stringify({ message:"email & password required" }), { status: 400 });
  const exists = await User.findOne({ email });
  if (exists) return new Response(JSON.stringify({ message:"Email exists" }), { status: 409 });
  const hash = await bcrypt.hash(password, 10);
  const created = await User.create({ email, passwordHash: password, isAdmin });
  return new Response(JSON.stringify({ id: created._id }), { status: 201 });
}
