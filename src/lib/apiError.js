export function apiMessage(error, fallback = "요청에 실패했습니다.") {
  return (
    error?.response?.data?.result?.error ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export function money(value, digits = 2) {
  const n = Number(value || 0);
  return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

export function when(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
}

export function pill(status) {
  const s = String(status || "").toLowerCase();
  if (["active", "completed", "approved", "success", "login"].includes(s)) return "ok";
  if (["pending", "processing", "register"].includes(s)) return "warn";
  if (["blocked", "rejected", "failed", "cancelled"].includes(s)) return "bad";
  return "info";
}
