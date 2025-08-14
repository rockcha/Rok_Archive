// src/store/admin.ts
import { create } from "zustand";
import { supabase } from "@/shared/lib/supabase";

type AdminState = {
  isAdmin: boolean;
  hydrated: boolean; // ✅ 초기화 완료 플래그(깜빡임 방지용)
  setAdmin: (v: boolean) => void;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
};

export const useAdmin = create<AdminState>((set) => ({
  isAdmin: false,
  hydrated: false,
  setAdmin: (v) => set({ isAdmin: v }),

  // ✅ 새로고침 후 기존 세션을 읽어와 반영
  checkSession: async () => {
    const { data, error } = await supabase.auth.getUser();
    set({ isAdmin: !!data.user, hydrated: true });
    if (error) console.warn("checkSession error:", error.message);
  },

  // ✅ 로그아웃
  logout: async () => {
    await supabase.auth.signOut();
    set({ isAdmin: false });
  },
}));

// ✅ 앱 구동 중 로그인/로그아웃/토큰갱신을 실시간 반영
supabase.auth.onAuthStateChange((_event, session) => {
  useAdmin.setState({ isAdmin: !!session?.user });
});
