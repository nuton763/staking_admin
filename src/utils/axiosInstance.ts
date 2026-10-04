import axios from "axios";
import {
  getSessionToken,
  getRefreshToken,
  setSessionAccessAndRefreshToken,
  removeSessionAndLogoutUser,
} from "./sessionManager";

const api = axios.create({
  baseURL: "",
  withCredentials: true,
});

// ✅ 요청 인터셉터 - 헤더에 토큰 추가
api.interceptors.request.use((config) => {
  const token = getSessionToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ✅ 응답 인터셉터 - 401 발생 시 자동 재발급
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Access Token 만료된 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          removeSessionAndLogoutUser();
          return Promise.reject(error);
        }
        // console.log(refreshToken)
        // 새 Access Token 요청
        const res = await axios.post(
          `/api/auth/refresh-token`,
          {refreshToken},
          { withCredentials: true }
        );
        const { access_token, refresh_token } = res?.data?.result?.data;
        setSessionAccessAndRefreshToken(access_token, refresh_token);

        api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
        onRefreshed(access_token);

        return api(originalRequest);
      } catch (err) {
        console.log(err)
        removeSessionAndLogoutUser();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
