import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import TransactionManagementPage from "./ui";

export const metadata = { title: "Manage Deposit,Withdrwal,Swap – INFINITE Admin" };

export default async function Mangehistory() {
  return <TransactionManagementPage />;
}
