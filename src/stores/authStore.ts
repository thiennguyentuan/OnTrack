import { create } from 'zustand';
import type { ApiUser } from '@/lib/api-client';

export type LocalSession = { access_token: string; user: ApiUser };

interface AuthState {
  session: LocalSession | null;
  user: ApiUser | null;
  initialized: boolean;
  setSession: (session: LocalSession | null) => void;
  setInitialized: (initialized: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  initialized: false,
  setSession: (session) => set({ session, user: session?.user ?? null }),
  setInitialized: (initialized) => set({ initialized }),
  signOut: () => set({ session: null, user: null }),
}));
