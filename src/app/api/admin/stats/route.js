import { dbConnect } from "@/lib/db";
import MixSession from "@/models/MixSession";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return new Response(JSON.stringify({ message:"Unauthorized" }), { status: 401 });

  await dbConnect();
  const total = await MixSession.countDocuments();
  const completed = await MixSession.countDocuments({ status: "completed" });
  const waiting = await MixSession.countDocuments({ status: "waiting_deposit" });
  const errors = await MixSession.countDocuments({ status: "error" });

  return new Response(JSON.stringify({ total, completed, waiting, errors }), { status: 200 });
}
