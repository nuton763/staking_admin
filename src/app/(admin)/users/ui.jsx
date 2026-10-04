"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/utils/axiosInstance";
import { apiMessage, money, pill, when } from "@/lib/apiError";
import { PERMISSIONS, currentRoles } from "@/lib/permissions";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [canAssign, setCanAssign] = useState(false);
  const [roleDrafts, setRoleDrafts] = useState({});
  const [saved, setSaved] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const load = () => {
    api
      .get("/api/user/all-users-list")
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];
        setUsers(rows);
        setRoleDrafts(Object.fromEntries(rows.map((user) => [user._id, user.roles || []])));
      })
      .catch((err) => setError(apiMessage(err, "사용자 목록을 불러오지 못했습니다.")));
  };

  useEffect(() => {
    setCanAssign(currentRoles().includes("superadmin"));
    load();
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user) =>
      [user.userId, user.userName, user.email, user.status, user.signupIp, user.lastLoginIp]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [users, query]);

  const save = async () => {
    try {
      const res = await api.put(`/api/user/update/${editing._id}`, {
        userId: editing.userId,
        userName: editing.userName,
        email: editing.email,
        status: editing.status,
      });
      setUsers((rows) => rows.map((user) => (user._id === editing._id ? res.data : user)));
      setDetail((current) =>
        current?.user && (current.user.id === editing._id || current.user._id === editing._id)
          ? { ...current, user: { ...current.user, ...res.data, id: editing._id } }
          : current
      );
      setEditing(null);
      setError("");
    } catch (err) {
      setError(apiMessage(err));
    }
  };

  const openDetail = async (user) => {
    setSelectedId(user._id);
    setEditing(null);
    setDetailLoading(true);
    setDetail({ user: { ...user, id: user._id }, purchases: [], summary: null });
    try {
      const res = await api.get(`/api/user/detail/${user._id}`);
      setDetail(res.data);
      setError("");
    } catch (err) {
      setError(apiMessage(err, "상세 정보를 불러오지 못했습니다."));
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const setBlocked = async (user, blocked) => {
    const userId = user._id || user.id;
    try {
      await api.put(`/api/user/${blocked ? "blocked-user" : "unblocked-user"}/${userId}`);
      const status = blocked ? "blocked" : "logout";
      setUsers((rows) => rows.map((row) => (row._id === userId ? { ...row, status } : row)));
      setDetail((current) =>
        current?.user?.id === userId || current?.user?._id === userId
          ? { ...current, user: { ...current.user, status } }
          : current
      );
    } catch (err) {
      setError(apiMessage(err));
    }
  };

  const toggleRole = (id, role) => {
    setRoleDrafts((prev) => {
      const current = prev[id] || [];
      const next = current.includes(role) ? current.filter((item) => item !== role) : [...current, role];
      return { ...prev, [id]: next };
    });
  };

  const saveRoles = async (user) => {
    setSaved("");
    setError("");
    try {
      const res = await api.put(`/api/user/roles/${user._id}`, { roles: roleDrafts[user._id] || [] });
      setUsers((rows) => rows.map((row) => (row._id === user._id ? { ...row, ...res.data } : row)));
      setDetail((current) =>
        current?.user && (current.user.id === user._id || current.user._id === user._id)
          ? { ...current, user: { ...current.user, ...res.data, id: user._id } }
          : current
      );
      setSaved(`${user.userId} 권한을 저장했습니다.`);
    } catch (err) {
      setError(apiMessage(err));
    }
  };

  const setLocked = async (user, locked) => {
    const userId = user._id || user.id;
    const lockedReason = locked ? window.prompt("잠금 이유", user.lockedReason || "") : "";
    if (locked && lockedReason === null) return;
    try {
      const res = await api.put(`/api/user/lock/${userId}`, { locked, lockedReason });
      setUsers((rows) => rows.map((row) => (row._id === userId ? { ...row, ...res.data } : row)));
      setDetail((current) =>
        current?.user && (current.user.id === userId || current.user._id === userId)
          ? { ...current, user: { ...current.user, ...res.data, id: userId } }
          : current
      );
      setError("");
    } catch (err) {
      setError(apiMessage(err));
    }
  };

  const lockIp = async (ip, locked) => {
    if (!ip) return;
    const verb = locked ? "잠글까요" : "잠금을 해제할까요";
    if (!window.confirm(`${ip} 로 가입하거나 로그인한 계정을 ${verb}? 내 계정은 제외됩니다.`)) return;
    const lockedReason = locked ? window.prompt("잠금 이유", `IP ${ip}`) : "";
    if (locked && lockedReason === null) return;
    try {
      await api.put("/api/user/lock-by-ip", { ip, locked, lockedReason });
      load();
    } catch (err) {
      setError(apiMessage(err));
    }
  };

  const remove = async (user) => {
    if (!window.confirm(`${user.userId} 계정을 삭제할까요?`)) return;
    try {
      await api.delete(`/api/user/delete-user/${user._id}`);
      setUsers((rows) => rows.filter((row) => row._id !== user._id));
      if (selectedId === user._id) {
        setSelectedId("");
        setDetail(null);
      }
    } catch (err) {
      setError(apiMessage(err));
    }
  };

  const closeDetail = () => {
    setDetail(null);
    setSelectedId("");
    setEditing(null);
  };

  const account = users.find((user) => user._id === selectedId);

  return (
    <div>
      <header className="adm-head">
        <h1>사용자</h1>
        <p>표에서 계정을 찾고, 상세를 누르면 구매·토큰·가입 정보와 차단을 모달에서 다룹니다.</p>
      </header>
      <div className="adm-toolbar">
        <input
          className="adm-input"
          placeholder="아이디, 이메일, IP"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {error && <p className="adm-error">{error}</p>}
      {saved && <p style={{ color: "#6ee7b7" }}>{saved}</p>}
      <div className="adm-panel adm-table-wrap">
        <table className="adm-table users">
          <thead>
            <tr>
              <th>아이디</th>
              <th>이름</th>
              <th>이메일</th>
              <th>상태</th>
              <th>USDT</th>
              <th>가입 IP</th>
              <th>최근 로그인 IP</th>
              <th>잠금</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td className="adm-empty" colSpan={9}>사용자가 없습니다.</td></tr>
            ) : visible.map((user) => (
              <tr key={user._id}>
                <td data-label="아이디">{user.userId}</td>
                <td data-label="이름">{user.userName || "—"}</td>
                <td data-label="이메일">{user.email || "—"}</td>
                <td data-label="상태"><span className={`adm-pill ${pill(user.status)}`}>{user.status}</span></td>
                <td data-label="USDT">{money(user.usdtBalance)}</td>
                <td data-label="가입 IP">{user.signupIp || "—"}</td>
                <td data-label="최근 로그인">
                  <div>{user.lastLoginIp || "—"}</div>
                  <small style={{ color: "#93a4b8" }}>{when(user.lastLoginAt)}</small>
                </td>
                <td data-label="잠금">
                  <span className={`adm-pill ${user.locked ? "bad" : "ok"}`}>{user.locked ? "잠김" : "정상"}</span>
                </td>
                <td data-label="">
                  <button className="adm-btn primary" type="button" onClick={() => openDetail(user)}>상세</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {detail && (
        <div className="adm-modal" onClick={closeDetail}>
          <div className="adm-panel sheet" onClick={(e) => e.stopPropagation()}>
            <div className="adm-actions" style={{ justifyContent: "space-between", marginBottom: 12 }}>
              <div>
                <h2 style={{ margin: 0 }}>{detail.user?.userId || "사용자"}</h2>
                <small style={{ color: "#94a3b8" }}>{detail.user?.email}</small>
              </div>
              <button className="adm-btn ghost" type="button" onClick={closeDetail}>닫기</button>
            </div>
            {detailLoading && !detail.summary ? (
              <div className="adm-empty">불러오는 중…</div>
            ) : (
              <>
                <div className="adm-actions">
                  <span className={`adm-pill ${pill(detail.user.status)}`}>{detail.user.status}</span>
                  <span className={`adm-pill ${detail.user.locked ? "bad" : "ok"}`}>{detail.user.locked ? "잠김" : "정상"}</span>
                  {detail.user.status === "blocked" ? (
                    <button className="adm-btn ghost" type="button" onClick={() => setBlocked(detail.user, false)}>차단 해제</button>
                  ) : (
                    <button className="adm-btn danger" type="button" onClick={() => setBlocked(detail.user, true)}>사용자 차단</button>
                  )}
                  <button className="adm-btn ghost" type="button" onClick={() => setLocked(detail.user, !detail.user.locked)}>
                    {detail.user.locked ? "잠금 해제" : "계정 잠금"}
                  </button>
                  <button className="adm-btn ghost" type="button" onClick={() => setEditing(editing ? null : { ...(account || detail.user), _id: selectedId })}>
                    {editing ? "수정 닫기" : "정보 수정"}
                  </button>
                  {account && (
                    <button className="adm-btn danger" type="button" onClick={() => remove(account)}>삭제</button>
                  )}
                </div>
                {detail.user.lockedReason && (
                  <p style={{ color: "#fda4af" }}>잠금 이유: {detail.user.lockedReason}</p>
                )}
                {editing && (
                  <div className="adm-form adm-section">
                    <label>아이디
                      <input className="adm-input" value={editing.userId || ""} onChange={(e) => setEditing({ ...editing, userId: e.target.value })} />
                    </label>
                    <label>이름
                      <input className="adm-input" value={editing.userName || ""} onChange={(e) => setEditing({ ...editing, userName: e.target.value })} />
                    </label>
                    <label>이메일
                      <input className="adm-input" value={editing.email || ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
                    </label>
                    <label>상태
                      <select className="adm-select" value={editing.status || "logout"} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                        {["register", "login", "logout", "blocked", "otp"].map((status) => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </label>
                    <div className="adm-actions" style={{ alignSelf: "end" }}>
                      <button className="adm-btn primary" type="button" onClick={save}>저장</button>
                    </div>
                  </div>
                )}
                <div className="adm-section">
                  <h3>계정</h3>
                  <div className="adm-facts">
                    <div><span>이름</span><strong>{detail.user.userName || "—"}</strong></div>
                    <div><span>인증</span><strong>{detail.user.verified ? "완료" : "미인증"}</strong></div>
                    <div><span>가입 시각</span><strong>{when(detail.user.createdAt)}</strong></div>
                    <div><span>마지막 로그인</span><strong>{when(detail.user.lastLoginAt)}</strong></div>
                    <div>
                      <span>가입 IP</span>
                      <strong>{detail.user.signupIp || "—"}</strong>
                      {detail.user.signupIp && (
                        <button className="adm-btn ghost" type="button" style={{ marginTop: 8 }} onClick={() => lockIp(detail.user.signupIp, true)}>이 IP 잠금</button>
                      )}
                    </div>
                    <div>
                      <span>최근 로그인 IP</span>
                      <strong>{detail.user.lastLoginIp || "—"}</strong>
                      {detail.user.lastLoginIp && detail.user.lastLoginIp !== detail.user.signupIp && (
                        <button className="adm-btn ghost" type="button" style={{ marginTop: 8 }} onClick={() => lockIp(detail.user.lastLoginIp, true)}>이 IP 잠금</button>
                      )}
                    </div>
                    <div><span>추천 코드</span><strong>{detail.user.referralCode || "—"}</strong></div>
                    <div><span>입금 주소</span><strong>{detail.user.depositAddress || "—"}</strong></div>
                  </div>
                </div>
                <div className="adm-section">
                  <h3>토큰</h3>
                  <div className="adm-facts">
                    <div><span>USDT</span><strong>{money(detail.user.usdtBalance)}</strong></div>
                    <div><span>언락 ROC</span><strong>{money(detail.user.totalUnlocked, 4)}</strong></div>
                    <div><span>락 ROC</span><strong>{money(detail.user.totalLocked, 4)}</strong></div>
                    <div><span>Fuel</span><strong>{money(detail.user.fuel, 4)}</strong></div>
                    <div><span>지급된 ROC</span><strong>{money(detail.summary?.rocRewarded, 4)}</strong></div>
                    <div><span>구매</span><strong>{detail.summary?.purchaseCount || 0}건 / {money(detail.summary?.totalPaid)} USDT</strong></div>
                  </div>
                </div>
                {canAssign && account && (
                  <div className="adm-section">
                    <h3>권한</h3>
                    <div className="adm-roles" style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                      {PERMISSIONS.map((item) => (
                        <label key={item.id}>
                          <input
                            type="checkbox"
                            checked={(roleDrafts[account._id] || []).includes(item.id)}
                            onChange={() => toggleRole(account._id, item.id)}
                          />
                          {item.label}
                        </label>
                      ))}
                      <button className="adm-btn primary" type="button" onClick={() => saveRoles(account)}>권한 저장</button>
                    </div>
                  </div>
                )}
                <div className="adm-section">
                  <h3>구매 내역</h3>
                  <div className="adm-table-wrap">
                    <table className="adm-table tight">
                      <thead>
                        <tr>
                          <th>패키지</th>
                          <th>결제</th>
                          <th>진행</th>
                          <th>지급 ROC</th>
                          <th>언락</th>
                          <th>락</th>
                          <th>상태</th>
                          <th>시작</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(detail.purchases || []).length === 0 ? (
                          <tr><td className="adm-empty" colSpan={8}>구매 내역이 없습니다.</td></tr>
                        ) : detail.purchases.map((row) => (
                          <tr key={row.transactionId}>
                            <td>{row.name}</td>
                            <td>{money(row.price)} USDT</td>
                            <td>{row.rewardedDays}일</td>
                            <td>{money(row.rocRewarded, 4)}</td>
                            <td>{money(row.unlockedRewarded, 4)}</td>
                            <td>{money(row.lockedRewarded, 4)}</td>
                            <td><span className={`adm-pill ${pill(row.status)}`}>{row.status}</span></td>
                            <td>{when(row.startDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
