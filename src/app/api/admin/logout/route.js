import { cookies } from "next/headers";
export async function POST() {
  const cs = await cookies();
  cs.delete("admin_token");
  return new Response(JSON.stringify({ ok:true }), { status: 200 });
}
