import { dbConnect } from "@/lib/db";
import MixSession from "@/models/MixSession";
import { NextResponse } from "next/server";

// 세션 삭제
export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { id } = params;

    if (!id) return NextResponse.json({ message: "Session ID required" }, { status: 400 });

    const session = await MixSession.findByIdAndDelete(id);
    if (!session) {
      return NextResponse.json({ message: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Session deleted successfully", session });
  } catch (err) {
    console.error("❌ Error deleting session:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
