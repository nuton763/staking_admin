import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserManagementPage from "./ui";

export const metadata = { title: "Users – Staking platform" };

export default async function UsersPage() {
  return <UserManagementPage />
}
