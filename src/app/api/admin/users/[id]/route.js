import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { requireAdmin } from "@/lib/auth";
import mongoose from "mongoose";

export async function DELETE(_req, { params }) {
  const admin = await requireAdmin();
  if (!admin) return new Response(JSON.stringify({ message:"Unauthorized" }), { status: 401 });

  await dbConnect();
  const { id } = params || {};
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return new Response(JSON.stringify({ message:"invalid id" }), { status: 400 });
  }
  await User.deleteOne({ _id: id });
  return new Response(JSON.stringify({ ok:true }), { status: 200 });
}
