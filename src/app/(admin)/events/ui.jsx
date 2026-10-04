"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axiosInstance";
import { apiMessage, money, when } from "@/lib/apiError";

const empty = {
  title: "",
  description: "",
  rewardAmount: 50,
  maxRecipients: 50,
  active: true,
  startsAt: "",
  endsAt: "",
};

function toInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    api.get("/api/promo")
      .then((res) => setEvents(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(apiMessage(err, "이벤트 권한이 없습니다.")));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const body = {
      ...form,
      type: "first_login_bonus",
      startsAt: form.startsAt || null,
      endsAt: form.endsAt || null,
    };
    try {
      if (editing) await api.put(`/api/promo/${editing}`, body);
      else await api.post("/api/promo", body);
      setForm(empty);
      setEditing(null);
      setError("");
      load();
    } catch (err) {
      setError(apiMessage(err));
    }
  };

  return (
    <div>
      <header className="adm-head">
        <h1>가입 보상 이벤트</h1>
        <p>이벤트 시작 이후 가입한 사용자가 첫 로그인할 때 언락 ROC를 받습니다. 선착순 인원과 금액은 여기서 정합니다.</p>
      </header>
      <form className="adm-panel adm-form" onSubmit={submit}>
        <label className="wide">제목<input className="adm-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <label className="wide">설명<textarea className="adm-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <label>지급 ROC<input className="adm-input" required type="number" min="0" value={form.rewardAmount} onChange={(e) => setForm({ ...form, rewardAmount: e.target.value })} /></label>
        <label>선착순 인원<input className="adm-input" required type="number" min="1" value={form.maxRecipients} onChange={(e) => setForm({ ...form, maxRecipients: e.target.value })} /></label>
        <label>시작<input className="adm-input" type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} /></label>
        <label>종료<input className="adm-input" type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} /></label>
        <label><span>활성</span><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /></label>
        <div className="wide adm-actions">
          <button className="adm-btn primary" type="submit">{editing ? "수정 저장" : "이벤트 만들기"}</button>
          {editing && <button className="adm-btn ghost" type="button" onClick={() => { setEditing(null); setForm(empty); }}>취소</button>}
        </div>
        {error && <p className="adm-error wide">{error}</p>}
      </form>
      <div className="adm-panel adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>제목</th>
              <th>보상</th>
              <th>지급</th>
              <th>기간</th>
              <th>상태</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 ? (
              <tr><td className="adm-empty" colSpan={6}>이벤트가 없습니다.</td></tr>
            ) : events.map((event) => (
              <tr key={event._id}>
                <td>
                  <strong>{event.title}</strong>
                  <div style={{ color: "#93a4b8" }}>{event.description}</div>
                </td>
                <td>{money(event.rewardAmount, 4)} ROC</td>
                <td>{event.claimedCount || 0} / {event.maxRecipients}</td>
                <td>{when(event.startsAt)} ~ {event.endsAt ? when(event.endsAt) : "제한 없음"}</td>
                <td><span className={`adm-pill ${event.active ? "ok" : "bad"}`}>{event.active ? "활성" : "중지"}</span></td>
                <td>
                  <button className="adm-btn ghost" type="button" onClick={() => {
                    setEditing(event._id);
                    setForm({
                      title: event.title || "",
                      description: event.description || "",
                      rewardAmount: event.rewardAmount ?? 0,
                      maxRecipients: event.maxRecipients ?? 1,
                      active: event.active !== false,
                      startsAt: toInput(event.startsAt),
                      endsAt: toInput(event.endsAt),
                    });
                  }}>수정</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
