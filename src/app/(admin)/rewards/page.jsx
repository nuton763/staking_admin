import { requireAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import RewardManagementPage from "./ui";

export const metadata = { title: "Reward management – Staking Platform" };

export default async function RewardPage() {
  
  return <RewardManagementPage />;
}
