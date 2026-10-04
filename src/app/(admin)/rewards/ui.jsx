"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axiosInstance";
import { apiMessage, money, pill, when } from "@/lib/apiError";

export default function RewardManagementPage() {
  const [transactions, setTransactions] = useState([]);
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/transaction/all")
      .then((res) => setTransactions(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(apiMessage(err, "구매 목록을 불러오지 못했습니다. package 권한이 필요합니다.")));
  }, []);

  const openHistory = async (tx) => {
    setSelected(tx._id);
    setHistory([]);
    try {
      const res = await api.get(`/api/transaction/detail/${tx._id}`);
      const rows = Array.isArray(res.data?.history) ? res.data.history : [];
      setHistory(rows);
    } catch (err) {
      setError(apiMessage(err));
    }
  };

  return (
    <div>
      <header className="adm-head">
        <h1>구매·보상</h1>
        <p>전체 패키지 구매와 일일 보상 이력입니다. 삭제된 패키지도 구매 기록은 남습니다.</p>
      </header>
      {error && <p className="adm-error">{error}</p>}
      <div className="adm-panel adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>패키지</th>
              <th>결제</th>
              <th>진행</th>
              <th>상태</th>
              <th>시작</th>
              <th>종료</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr><td className="adm-empty" colSpan={7}>구매 내역이 없습니다.</td></tr>
            ) : transactions.map((tx) => (
              <tr key={tx._id}>
                <td>{tx.package_id?.name || "Deleted package"}</td>
                <td>{money(tx.paidAmount)} USDT</td>
                <td>{tx.rewardedDays ?? 0}일</td>
                <td><span className={`adm-pill ${pill(tx.status)}`}>{tx.status}</span></td>
                <td>{when(tx.startDate)}</td>
                <td>{when(tx.endDate)}</td>
                <td>
                  <button className="adm-btn ghost" type="button" onClick={() => openHistory(tx)}>보상 이력</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="adm-panel adm-table-wrap">
          <h2 style={{ marginTop: 0 }}>보상 이력</h2>
          <table className="adm-table">
            <thead>
              <tr>
                <th>일차</th>
                <th>지급일</th>
                <th>합계</th>
                <th>언락</th>
                <th>락</th>
                <th>Fuel</th>
                <th>해제</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr><td className="adm-empty" colSpan={7}>아직 지급된 보상이 없습니다.</td></tr>
              ) : history.map((row, index) => (
                <tr key={`${row.day}-${index}`}>
                  <td>{row.day}</td>
                  <td>{when(row.rewardDate)}</td>
                  <td>{money(row.totalReward, 4)}</td>
                  <td>{money(row.unlocked, 4)}</td>
                  <td>{money(row.locked, 4)}</td>
                  <td>{money(row.fuel, 4)}</td>
                  <td>{when(row.unlockAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
