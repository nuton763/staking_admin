"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setSessionUserAndToken } from "@/utils/sessionManager";
import { useAdminStore } from "@/store/useAuthStore";

export default function AdminLogin() {
  const router = useRouter();
  const setAdminData = useAdminStore((s) => s.setAdminData);
  const [form, setForm] = useState({ userId: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const res = await response.json();
      if (!response.ok || !res?.access_token) {
        setError(res?.result?.error || res?.result?.message || "로그인에 실패했습니다.");
        return;
      }
      setSessionUserAndToken(res?.result?.data, res.access_token, res.refresh_token);
      if (res.maintenance_info) setAdminData(res.maintenance_info);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message || "로그인에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="adm-login">
      <form className="adm-panel" onSubmit={handleSubmit}>
        <small style={{ color: "#22d3ee", letterSpacing: "0.18em", fontWeight: 700 }}>
          ROCKET STAKE
        </small>
        <h1>관리자 로그인</h1>
        <p>현재 스테이킹 API의 관리자 계정으로 들어갑니다.</p>
        <label>
          아이디
          <input
            className="adm-input"
            style={{ width: "100%", marginTop: 6 }}
            value={form.userId}
            onChange={(e) => setForm({ ...form, userId: e.target.value })}
            autoComplete="username"
            required
          />
        </label>
        <label>
          비밀번호
          <input
            className="adm-input"
            style={{ width: "100%", marginTop: 6 }}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password"
            required
          />
        </label>
        <button className="adm-btn primary" style={{ width: "100%", marginTop: 18 }} disabled={loading}>
          {loading ? "확인 중…" : "로그인"}
        </button>
        {error && <p className="adm-error">{error}</p>}
      </form>
    </div>
  );
}
