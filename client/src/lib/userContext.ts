import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  id: string | null;
  username: string | null;
  name: string;
  token: string | null;
  isAuthenticated: boolean;
  setUserData: (user: { id: string; username: string; name: string }) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      id: null,
      username: null,
      name: 'Friend',
      token: null,
      isAuthenticated: false,

      setUserData: (user) => {
        set({
          id: user.id,
          username: user.username,
          name: user.name,
          isAuthenticated: true,
        });
      },

      setToken: (token) => {
        set({ token, isAuthenticated: true });
      },

      logout: () => {
        set({
          id: null,
          username: null,
          name: 'Friend',
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'daily-flow-user',
    }
  )
);
