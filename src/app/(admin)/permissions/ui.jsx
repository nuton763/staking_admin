"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/utils/axiosInstance";
import { apiMessage } from "@/lib/apiError";
import { PERMISSIONS } from "@/lib/permissions";

export default function PermissionsPage() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [drafts, setDrafts] = useState({});
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const load = () => {
    api.get("/api/user/roles")
      .then((res) => {
        const rows = Array.isArray(res.data) ? res.data : [];
        setUsers(rows);
        setDrafts(Object.fromEntries(rows.map((user) => [user._id, user.roles || []])));
      })
      .catch((err) => setError(apiMessage(err, "최고 관리자만 권한을 볼 수 있습니다.")));
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = q
      ? users.filter((user) => [user.userId, user.userName, user.email].join(" ").toLowerCase().includes(q))
      : users;
    return rows.filter((user) => user.role === "admin" || (user.roles || []).length || query.trim());
  }, [users, query]);

  const toggle = (id, role) => {
    setDrafts((prev) => {
      const current = prev[id] || [];
      const next = current.includes(role) ? current.filter((item) => item !== role) : [...current, role];
      return { ...prev, [id]: next };
    });
  };

  const save = async (user) => {
    setSaved("");
    setError("");
    try {
      const res = await api.put(`/api/user/roles/${user._id}`, { roles: drafts[user._id] || [] });
      setUsers((rows) => rows.map((row) => (row._id === user._id ? { ...row, ...res.data } : row)));
      setSaved(`${user.userId} 권한을 저장했습니다.`);
    } catch (err) {
      setError(apiMessage(err));
    }
  };

  return (
    <div>
      <header className="adm-head">
        <h1>권한</h1>
        <p>최고 관리자만 권한을 나눕니다. 권한이 하나라도 있으면 관리자 로그인이 가능하고, 없으면 일반 사용자로 돌아갑니다.</p>
      </header>
      <div className="adm-toolbar">
        <input className="adm-input" placeholder="아이디, 이름, 이메일" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      {error && <p className="adm-error">{error}</p>}
      {saved && <p style={{ color: "#a7f3d0" }}>{saved}</p>}
      <div className="adm-panel adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>계정</th>
              {PERMISSIONS.map((item) => <th key={item.id}>{item.label}</th>)}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr><td className="adm-empty" colSpan={6}>계정이 없습니다. 검색하면 일반 사용자도 나옵니다.</td></tr>
            ) : visible.map((user) => (
              <tr key={user._id}>
                <td>
                  <strong>{user.userId}</strong>
                  <div style={{ color: "#93a4b8" }}>{user.userName} · {user.role}</div>
                </td>
                {PERMISSIONS.map((item) => (
                  <td key={item.id}>
                    <input
                      type="checkbox"
                      checked={(drafts[user._id] || []).includes(item.id)}
                      onChange={() => toggle(user._id, item.id)}
                    />
                  </td>
                ))}
                <td>
                  <button className="adm-btn primary" type="button" onClick={() => save(user)}>저장</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
