"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axiosInstance";
import { apiMessage, money } from "@/lib/apiError";

const emptyForm = {
  name: "",
  nodeCount: "",
  dailyReward: "",
  dailyFuelReward: "",
  price: "",
  packageImage: null,
};

export default function PackageManagementPage() {
  const [packages, setPackages] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const load = () => {
    api.get("/api/package")
      .then((res) => setPackages(Array.isArray(res.data) ? res.data : []))
      .catch((err) => setError(apiMessage(err)));
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", form.name);
    data.append("nodeCount", form.nodeCount);
    data.append("dailyReward", form.dailyReward);
    data.append("dailyFuelReward", form.dailyFuelReward);
    data.append("price", form.price);
    if (form.packageImage) data.append("packageImage", form.packageImage);

    try {
      if (editing) {
        const res = await api.put(`/api/package/${editing}`, data);
        setPackages((rows) => rows.map((pkg) => (pkg._id === editing ? res.data : pkg)));
      } else {
        const res = await api.post("/api/package", data);
        setPackages((rows) => [...rows, res.data]);
      }
      setForm(emptyForm);
      setEditing(null);
      setError("");
    } catch (err) {
      setError(apiMessage(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm("이 패키지를 삭제할까요? 이미 구매한 내역은 남습니다.")) return;
    try {
      await api.delete(`/api/package/${id}`);
      setPackages((rows) => rows.filter((pkg) => pkg._id !== id));
    } catch (err) {
      setError(apiMessage(err));
    }
  };

  return (
    <div>
      <header className="adm-head">
        <h1>패키지</h1>
        <p>이름, 노드 수, 일일 ROC, 일일 Fuel, 가격, 이미지를 현재 패키지 API로 저장합니다.</p>
      </header>
      <form className="adm-panel adm-form" onSubmit={submit}>
        <label>이름<input className="adm-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label>노드<input className="adm-input" required type="number" min="0" value={form.nodeCount} onChange={(e) => setForm({ ...form, nodeCount: e.target.value })} /></label>
        <label>가격 USDT<input className="adm-input" required type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></label>
        <label>일일 ROC<input className="adm-input" required type="number" min="0" value={form.dailyReward} onChange={(e) => setForm({ ...form, dailyReward: e.target.value })} /></label>
        <label>일일 Fuel<input className="adm-input" required type="number" min="0" value={form.dailyFuelReward} onChange={(e) => setForm({ ...form, dailyFuelReward: e.target.value })} /></label>
        <label>이미지<input className="adm-input" type="file" accept="image/*" required={!editing} onChange={(e) => setForm({ ...form, packageImage: e.target.files?.[0] || null })} /></label>
        <div className="wide adm-actions">
          <button className="adm-btn primary" type="submit">{editing ? "수정 저장" : "패키지 추가"}</button>
          {editing && (
            <button className="adm-btn ghost" type="button" onClick={() => { setEditing(null); setForm(emptyForm); }}>
              취소
            </button>
          )}
        </div>
        {error && <p className="adm-error wide">{error}</p>}
      </form>

      <div className="adm-panel adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th></th>
              <th>이름</th>
              <th>가격</th>
              <th>노드</th>
              <th>일일 ROC</th>
              <th>일일 Fuel</th>
              <th>락/언락</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {packages.length === 0 ? (
              <tr><td className="adm-empty" colSpan={8}>패키지가 없습니다.</td></tr>
            ) : packages.map((pkg) => (
              <tr key={pkg._id}>
                <td>{pkg.packageimage ? <img className="adm-thumb" src={pkg.packageimage} alt="" /> : "—"}</td>
                <td>{pkg.name}</td>
                <td>{money(pkg.price)} USDT</td>
                <td>{pkg.nodeCount}</td>
                <td>{money(pkg.dailyReward, 4)}</td>
                <td>{money(pkg.dailyFuelReward, 4)}</td>
                <td>{pkg.lockRatio ?? "—"} / {pkg.unlockRatio ?? "—"}</td>
                <td>
                  <div className="adm-actions">
                    <button
                      className="adm-btn ghost"
                      type="button"
                      onClick={() => {
                        setEditing(pkg._id);
                        setForm({
                          name: pkg.name || "",
                          nodeCount: pkg.nodeCount ?? "",
                          dailyReward: pkg.dailyReward ?? "",
                          dailyFuelReward: pkg.dailyFuelReward ?? "",
                          price: pkg.price ?? "",
                          packageImage: null,
                        });
                      }}
                    >
                      수정
                    </button>
                    <button className="adm-btn danger" type="button" onClick={() => remove(pkg._id)}>삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
