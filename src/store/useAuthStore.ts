import { create } from "zustand";
import { persist } from "zustand/middleware";

// AdminData 타입 정의
type AdminData = {
  userCount: number;
  totalSwapAmount: number;
  totalBuyPackage: number;
  totalWithdrawAmount: number;
  totalDepositAmount: number;
  totalROCReward:number,
  setAdminData: (payload: Partial<AdminData>) => void;
};

export const useAdminStore = create(
  persist<AdminData>(
    (set) => ({
      userCount: 0,
      totalSwapAmount: 0,
      totalBuyPackage: 0,
      totalWithdrawAmount: 0,
      totalDepositAmount: 0,
      totalROCReward:0,
      setAdminData: (payload) =>
        set((state) => ({
          ...state,
          ...payload,
        })),
    }),
    {
      name: "user-storage", // 로컬 스토리지에 저장될 이름
      getStorage: () => localStorage, // localStorage 사용
    }
  )
);
