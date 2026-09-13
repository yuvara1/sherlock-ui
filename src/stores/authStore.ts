import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 5 * 60 * 1000; // 5 minutes

interface AuthState {
  // User
  user: User | null;
  isAuthenticated: boolean;

  // Tokens (never expose — backend should use httpOnly cookies in production)
  accessToken: string | null;
  refreshToken: string | null;

  // Rate limiting / lockout
  loginAttempts: number;
  lockedUntil: number | null;
  lastAttemptAt: number | null;

  // MFA
  mfaPending: boolean;
  mfaEmail: string;

  // Email verification
  verificationSent: boolean;
  verificationEmail: string;

  // Preferences
  rememberMe: boolean;
  lastEmail: string;

  // Actions
  login: (user: User, tokens: { accessToken: string; refreshToken: string }, remember: boolean) => void;
  logout: () => void;
  recordFailedAttempt: () => { locked: boolean; remaining: number };
  resetAttempts: () => void;
  isLocked: () => boolean;
  lockoutSecondsRemaining: () => number;
  setMfaPending: (email: string) => void;
  clearMfaPending: () => void;
  setVerificationSent: (email: string) => void;
  clearVerification: () => void;
  setRememberMe: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      loginAttempts: 0,
      lockedUntil: null,
      lastAttemptAt: null,
      mfaPending: false,
      mfaEmail: "",
      verificationSent: false,
      verificationEmail: "",
      rememberMe: false,
      lastEmail: "",

      login: (user, tokens, remember) =>
        set({
          user,
          isAuthenticated: true,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          loginAttempts: 0,
          lockedUntil: null,
          mfaPending: false,
          rememberMe: remember,
          lastEmail: remember ? user.email : "",
        }),

      logout: () =>
        set((s) => ({
          user: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          mfaPending: false,
          lastEmail: s.rememberMe ? s.lastEmail : "",
        })),

      recordFailedAttempt: () => {
        const attempts = get().loginAttempts + 1;
        const locked = attempts >= MAX_ATTEMPTS;
        set({
          loginAttempts: attempts,
          lastAttemptAt: Date.now(),
          lockedUntil: locked ? Date.now() + LOCKOUT_MS : null,
        });
        return { locked, remaining: Math.max(0, MAX_ATTEMPTS - attempts) };
      },

      resetAttempts: () => set({ loginAttempts: 0, lockedUntil: null, lastAttemptAt: null }),

      isLocked: () => {
        const { lockedUntil } = get();
        if (!lockedUntil) return false;
        if (Date.now() >= lockedUntil) {
          set({ lockedUntil: null, loginAttempts: 0 });
          return false;
        }
        return true;
      },

      lockoutSecondsRemaining: () => {
        const { lockedUntil } = get();
        if (!lockedUntil) return 0;
        return Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      },

      setMfaPending: (email) => set({ mfaPending: true, mfaEmail: email }),
      clearMfaPending: () => set({ mfaPending: false, mfaEmail: "" }),

      setVerificationSent: (email) => set({ verificationSent: true, verificationEmail: email }),
      clearVerification: () => set({ verificationSent: false, verificationEmail: "" }),

      setRememberMe: (v) => set({ rememberMe: v }),
    }),
    {
      name: "elora-auth",
      partialize: (s) => ({
        rememberMe: s.rememberMe,
        lastEmail: s.lastEmail,
        loginAttempts: s.loginAttempts,
        lockedUntil: s.lockedUntil,
        lastAttemptAt: s.lastAttemptAt,
      }),
    },
  ),
);
