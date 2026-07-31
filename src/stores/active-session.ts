import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type ActiveSessionState = {
  sessionId: string | null;
  taskId: string | null;
  status: 'idle' | 'running' | 'paused' | 'finished';
  startedAt: string | null;
  expectedEndAt: string | null;
  focusMode: 'NORMAL' | 'HIGH' | null;
  clear: () => void;
};

export const useActiveSessionStore = create<ActiveSessionState>()(persist((set) => ({
  sessionId: null, taskId: null, status: 'idle', startedAt: null, expectedEndAt: null, focusMode: null,
  clear: () => set({ sessionId: null, taskId: null, status: 'idle', startedAt: null, expectedEndAt: null, focusMode: null }),
}), { name: 'ontrack-active-session', storage: createJSONStorage(() => AsyncStorage) }));
