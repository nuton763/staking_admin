import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import PackageManagementPage from "./ui";

export const metadata = { title: "Sessions – INFINITE Admin" };

export default async function PackagePage() {
  return <PackageManagementPage />;
}
