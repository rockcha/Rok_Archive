// src/stores/counterStore.ts
import { create } from "zustand";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";

type CounterState = {
  count: number;
  step: number;
  min: number;
  max: number;
  inc: () => void;
  dec: () => void;
  incBy: (n: number) => void;
  decBy: (n: number) => void;
  set: (n: number) => void;
  reset: () => void;
  setStep: (n: number) => void;
  setBounds: (min: number, max: number) => void;
};

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export const useCounter = create<CounterState>()(
  devtools(
    persist(
      subscribeWithSelector((set) => ({
        count: 0,
        step: 1,
        min: -100,
        max: 100,

        inc: () =>
          set(
            (s) => ({ count: clamp(s.count + s.step, s.min, s.max) }),
            false,
            "inc"
          ),
        dec: () =>
          set(
            (s) => ({ count: clamp(s.count - s.step, s.min, s.max) }),
            false,
            "dec"
          ),

        incBy: (n: number) =>
          set(
            (s) => ({ count: clamp(s.count + n, s.min, s.max) }),
            false,
            "incBy"
          ),
        decBy: (n: number) =>
          set(
            (s) => ({ count: clamp(s.count - n, s.min, s.max) }),
            false,
            "decBy"
          ),

        set: (n: number) =>
          set((s) => ({ count: clamp(n, s.min, s.max) }), false, "set"),

        reset: () => set({ count: 0, step: 1 }, false, "reset"),

        setStep: (n: number) =>
          set({ step: Math.max(1, Math.floor(n)) }, false, "setStep"),

        setBounds: (min: number, max: number) =>
          set(
            (s) => {
              const lo = Math.min(min, max);
              const hi = Math.max(min, max);
              return { min: lo, max: hi, count: clamp(s.count, lo, hi) };
            },
            false,
            "setBounds"
          ),
      })),
      {
        name: "counter-store",
        // 로컬스토리지에 저장할 키만 선택
        partialize: (s) => ({
          count: s.count,
          step: s.step,
          min: s.min,
          max: s.max,
        }),
      }
    )
  )
);
