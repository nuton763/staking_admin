"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axiosInstance";
import { apiMessage, pill, when } from "@/lib/apiError";

const empty = {
  title: "",
  content: "",
  level: "info",
  audience: "all",
  pinned: false,
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

export default function NoticesPage() {
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    api.get("/api/notice")
      .then((res) => setNotices(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(apiMessage(err, "공지 권한이 없습니다.")));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const body = {
      ...form,
      startsAt: form.startsAt || null,
      endsAt: form.endsAt || null,
    };
    try {
      if (editing) await api.put(`/api/notice/${editing}`, body);
      else await api.post("/api/notice", body);
      setForm(empty);
      setEditing(null);
      setError("");
      load();
    } catch (err) {
      setError(apiMessage(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("이 공지를 삭제할까요?")) return;
    try {
      await api.delete(`/api/notice/${id}`);
      load();
    } catch (err) {
      setError(apiMessage(err));
    }
  };

  return (
    <div>
      <header className="adm-head">
        <h1>공지</h1>
        <p>최고 관리자만 공지를 작성합니다. 활성 공지는 사용자 페이지에 바로 보입니다.</p>
      </header>
      <form className="adm-panel adm-form" onSubmit={submit}>
        <label className="wide">제목<input className="adm-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
        <label className="wide">내용<textarea className="adm-input" required rows={4} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></label>
        <label>등급
          <select className="adm-select" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
            <option value="info">안내</option>
            <option value="warning">주의</option>
            <option value="important">중요</option>
          </select>
        </label>
        <label>대상
          <select className="adm-select" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
            <option value="all">전체</option>
            <option value="app">로그인 화면</option>
            <option value="landing">랜딩</option>
          </select>
        </label>
        <label>시작<input className="adm-input" type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} /></label>
        <label>종료<input className="adm-input" type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} /></label>
        <label><span>고정</span><input type="checkbox" checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} /></label>
        <label><span>활성</span><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /></label>
        <div className="wide adm-actions">
          <button className="adm-btn primary" type="submit">{editing ? "수정 저장" : "공지 등록"}</button>
          {editing && <button className="adm-btn ghost" type="button" onClick={() => { setEditing(null); setForm(empty); }}>취소</button>}
        </div>
        {error && <p className="adm-error wide">{error}</p>}
      </form>
      <div className="adm-panel" style={{ display: "grid", gap: 12 }}>
        {notices.length === 0 ? <div className="adm-empty">공지가 없습니다.</div> : notices.map((notice) => (
          <article key={notice._id}>
            <div className="adm-actions">
              <strong>{notice.title}</strong>
              <span className={`adm-pill ${pill(notice.level)}`}>{notice.level}</span>
              <span className={`adm-pill ${notice.active ? "ok" : "bad"}`}>{notice.active ? "활성" : "중지"}</span>
              {notice.pinned && <span className="adm-pill warn">고정</span>}
              <span className="adm-pill info">{notice.audience}</span>
            </div>
            <p style={{ whiteSpace: "pre-wrap" }}>{notice.content}</p>
            <small style={{ color: "#93a4b8" }}>{when(notice.createdAt)}</small>
            <div className="adm-actions" style={{ marginTop: 8 }}>
              <button className="adm-btn ghost" type="button" onClick={() => {
                setEditing(notice._id);
                setForm({
                  title: notice.title || "",
                  content: notice.content || "",
                  level: notice.level || "info",
                  audience: notice.audience || "all",
                  pinned: Boolean(notice.pinned),
                  active: notice.active !== false,
                  startsAt: toInput(notice.startsAt),
                  endsAt: toInput(notice.endsAt),
                });
              }}>수정</button>
              <button className="adm-btn danger" type="button" onClick={() => remove(notice._id)}>삭제</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
