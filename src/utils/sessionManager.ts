"use client";

import Cookies from "js-cookie"

const APP_USER_STORAGE = "BRF-USER-STORAGE";
const APP_ACCESS_TOKEN = "BRF-ACCESS-TOKEN";
const APP_REFRESH_TOKEN = "BRF-REFRESH-TOKEN";

/** 유저 가져오기 */
export const getSessionUser = () => {
  const userStr = localStorage.getItem(APP_USER_STORAGE);
  return userStr ? JSON.parse(userStr) : null;
};

/** Access Token 가져오기 (localStorage → cookie 순) */
export const getSessionToken = (): string | null => {
  return (
    localStorage.getItem(APP_ACCESS_TOKEN) || Cookies.get("AccessToken") || null
  );
};

/** Refresh Token 가져오기 */
export const getRefreshToken = (): string | null =>
  localStorage.getItem(APP_REFRESH_TOKEN) || null;

/** 로그인 시 저장 */
export const setSessionUserAndToken = (
  user: any,
  accessToken: string,
  refreshToken: string
) => {
  localStorage.setItem(APP_USER_STORAGE, JSON.stringify(user));
  localStorage.setItem(APP_ACCESS_TOKEN, accessToken);
  localStorage.setItem(APP_REFRESH_TOKEN, refreshToken);
  Cookies.set("AccessToken", accessToken, {
    path: "/",
    sameSite: "lax",
  });
  Cookies.set("RefreshToken", refreshToken, {
    path: "/",
    sameSite: "lax",
  });
};

/** AccessToken, RefreshToken 교체 */
export const setSessionAccessAndRefreshToken = (
  accessToken: string,
  refreshToken: string
) => {
  localStorage.setItem(APP_ACCESS_TOKEN, accessToken);
  localStorage.setItem(APP_REFRESH_TOKEN, refreshToken);
  Cookies.set("AccessToken", accessToken, { path: "/", sameSite: "lax" });
};

/** 로그아웃 */
export const removeSessionAndLogoutUser = () => {
  localStorage.removeItem(APP_USER_STORAGE);
  localStorage.removeItem(APP_ACCESS_TOKEN);
  localStorage.removeItem(APP_REFRESH_TOKEN);
  Cookies.remove("AccessToken", { path: "/" });
  window.location.href = "/login";
};
