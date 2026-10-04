import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import Dashboard from "./ui";

export const metadata = { title: "Dashboard – INFINITE Admin" };

export default async function DashboardPage() {
  // const admin = await requireAdmin();
  // if (!admin) redirect("/login");
  return <Dashboard />;
}
