export const PERMISSIONS = [
  { id: "user", label: "사용자 관리" },
  { id: "package", label: "패키지·구매" },
  { id: "wallet", label: "지갑" },
  { id: "superadmin", label: "최고 관리자" },
];

export function currentRoles() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("BRF-USER-STORAGE");
    const user = raw ? JSON.parse(raw) : {};
    return Array.isArray(user.roles) ? user.roles : [];
  } catch {
    return [];
  }
}
