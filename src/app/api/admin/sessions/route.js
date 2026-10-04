import { dbConnect } from "@/lib/db";
import MixSession from "@/models/MixSession";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return new Response(JSON.stringify({ message:"Unauthorized" }), { status: 401 });
  await dbConnect();
  const sessions = await MixSession.find().sort({ startedAt: -1 }).limit(500);
  return new Response(JSON.stringify(sessions), { status: 200 });
}