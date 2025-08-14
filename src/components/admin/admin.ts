// src/store/admin.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabase";

type AdminState = {
  isAdmin: boolean;
  setAdmin: (v: boolean) => void;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAdmin = create<AdminState>((set) => ({
  isAdmin: false,
  setAdmin: (v) => set({ isAdmin: v }),
  checkSession: async () => {
    const { data } = await supabase.auth.getUser();
    set({ isAdmin: !!data.user }); // 로그인되어 있으면 true (관리자 1명만 운용)
  },
  logout: async () => {
    await supabase.auth.signOut();
    set({ isAdmin: false });
  },
}));
