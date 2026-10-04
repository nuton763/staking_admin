"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import api from "@/utils/axiosInstance";
import { removeSessionAndLogoutUser } from "@/utils/sessionManager";
import { currentRoles } from "@/lib/permissions";

const tabs = [
  { label: "개요", path: "/dashboard" },
  { label: "사용자", path: "/users", role: "user" },
  { label: "패키지", path: "/packages", role: "package" },
  { label: "지갑", path: "/wallethistory", role: "wallet" },
  { label: "구매", path: "/rewards", role: "package" },
  { label: "공지", path: "/notices", role: "superadmin" },
  { label: "이벤트", path: "/events", role: "superadmin" },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    setRoles(currentRoles());
  }, []);

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      /* token may already be expired */
    }
    removeSessionAndLogoutUser();
  };

  const visible = tabs.filter((tab) => !tab.role || roles.includes(tab.role));

  return (
    <div className="adm-shell">
      <aside className="adm-side">
        <div className="adm-brand">
          <small>Rocket Stake</small>
          <strong>운영</strong>
        </div>
        <nav className="adm-nav">
          {visible.map((tab) => (
            <a
              key={tab.path}
              href={tab.path}
              className={pathname === tab.path ? "active" : ""}
              onClick={(e) => {
                e.preventDefault();
                router.push(tab.path);
              }}
            >
              {tab.label}
            </a>
          ))}
        </nav>
        <button type="button" className="adm-logout" onClick={logout}>
          로그아웃
        </button>
      </aside>
      <main className="adm-main">{children}</main>
    </div>
  );
}
