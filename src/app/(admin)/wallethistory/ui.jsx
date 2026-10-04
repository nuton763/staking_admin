"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/utils/axiosInstance";
import { apiMessage, money, pill, when } from "@/lib/apiError";

export default function WalletHistoryPage() {
  const [rows, setRows] = useState([]);
  const [type, setType] = useState("all");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  const load = () => {
    api.get("/api/wallet/all-history")
      .then((res) => setRows(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(apiMessage(err, "지갑 내역을 불러오지 못했습니다. wallet 권한이 필요합니다.")));
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(
    () => (type === "all" ? rows : rows.filter((row) => row.type === type)),
    [rows, type]
  );

  const decide = async (id, action) => {
    setBusy(id + action);
    setError("");
    try {
      await api.post(`/api/wallet/withdrawals/${id}/decision`, { action });
      load();
    } catch (err) {
      setError(apiMessage(err));
    } finally {
      setBusy("");
    }
  };

  return (
    <div>
      <header className="adm-head">
        <h1>지갑 내역</h1>
        <p>입금, 출금, 스왑 기록입니다. 대기 중인 출금만 승인하거나 거절할 수 있습니다.</p>
      </header>
      <div className="adm-toolbar">
        <select className="adm-select" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="all">전체</option>
          <option value="deposit">입금</option>
          <option value="withdraw">출금</option>
          <option value="swap">스왑</option>
        </select>
      </div>
      {error && <p className="adm-error">{error}</p>}
      <div className="adm-panel adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>사용자</th>
              <th>유형</th>
              <th>금액</th>
              <th>통화</th>
              <th>잔액</th>
              <th>주소</th>
              <th>상태</th>
              <th>시간</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td className="adm-empty" colSpan={9}>내역이 없습니다.</td></tr>
            ) : visible.map((row) => (
              <tr key={row._id}>
                <td>{row.userId?.userName || row.userId?.email || "—"}</td>
                <td>{row.type}</td>
                <td>{money(row.amount, 6)}</td>
                <td>{row.fromCurrency} → {row.toCurrency}</td>
                <td>{money(row.balanceAfter, 6)}</td>
                <td>{row.address || "—"}</td>
                <td><span className={`adm-pill ${pill(row.status)}`}>{row.status || "—"}</span></td>
                <td>{when(row.createdAt)}</td>
                <td>
                  {row.type === "withdraw" && row.status === "pending" && (
                    <div className="adm-actions">
                      <button className="adm-btn primary" type="button" disabled={!!busy} onClick={() => decide(row._id, "approve")}>승인</button>
                      <button className="adm-btn danger" type="button" disabled={!!busy} onClick={() => decide(row._id, "reject")}>거절</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
