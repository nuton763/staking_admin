"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axiosInstance";
import { useAdminStore } from "@/store/useAuthStore";
import { money } from "@/lib/apiError";

export default function Dashboard() {
  const snapshot = useAdminStore();
  const [live, setLive] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const next = {
        userCount: snapshot.userCount,
        packages: null,
        purchases: snapshot.totalBuyPackage,
        notices: null,
        deposit: snapshot.totalDepositAmount,
        withdraw: snapshot.totalWithdrawAmount,
        swap: snapshot.totalSwapAmount,
        reward: snapshot.totalROCReward,
      };
      try {
        const count = await api.get("/api/public/user-count");
        next.userCount = count.data?.count ?? next.userCount;
      } catch { /* keep login snapshot */ }
      try {
        const packages = await api.get("/api/package");
        next.packages = Array.isArray(packages.data) ? packages.data.length : 0;
      } catch { /* public list should succeed */ }
      try {
        const txs = await api.get("/api/transaction/all");
        next.purchases = Array.isArray(txs.data) ? txs.data.length : next.purchases;
      } catch { /* role package required */ }
      try {
        const notices = await api.get("/api/notice/active?audience=all");
        next.notices = Array.isArray(notices.data) ? notices.data.length : 0;
      } catch { /* notice list optional */ }
      try {
        const history = await api.get("/api/wallet/all-history");
        const rows = Array.isArray(history.data) ? history.data : [];
        const sum = (type) =>
          rows.filter((row) => row.type === type).reduce((acc, row) => acc + Number(row.amount || 0), 0);
        next.deposit = sum("deposit");
        next.withdraw = sum("withdraw");
        next.swap = sum("swap");
      } catch { /* role wallet required */ }
      if (!cancelled) setLive(next);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [snapshot.userCount, snapshot.totalBuyPackage, snapshot.totalDepositAmount, snapshot.totalWithdrawAmount, snapshot.totalSwapAmount, snapshot.totalROCReward]);

  const data = live || {
    userCount: snapshot.userCount,
    packages: "—",
    purchases: snapshot.totalBuyPackage,
    notices: "—",
    deposit: snapshot.totalDepositAmount,
    withdraw: snapshot.totalWithdrawAmount,
    swap: snapshot.totalSwapAmount,
    reward: snapshot.totalROCReward,
  };

  const cards = [
    ["사용자", data.userCount, "명"],
    ["판매 패키지", data.packages, "종"],
    ["구매 건수", data.purchases, "건"],
    ["활성 공지", data.notices, "개"],
    ["입금", money(data.deposit), "USDT"],
    ["출금", money(data.withdraw), "USDT"],
    ["스왑", money(data.swap), ""],
    ["지급된 ROC", money(data.reward, 4), "ROC"],
  ];

  return (
    <div>
      <header className="adm-head">
        <h1>대시보드</h1>
        <p>로그인 시점 합계와 지금 열려 있는 API 응답을 함께 보여 줍니다.</p>
      </header>
      <section className="adm-grid">
        {cards.map(([label, value, unit]) => (
          <article key={label} className="adm-card">
            <span>{label}</span>
            <strong>{value ?? "—"}</strong>
            <em>{unit}</em>
          </article>
        ))}
      </section>
    </div>
  );
}
