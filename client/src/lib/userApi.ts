import { useUserStore } from './userContext';

const API_BASE = '/api';

export const userApi = {
  init: async () => {
    const sessionId = useUserStore.getState().sessionId;
    const res = await fetch(`${API_BASE}/auth/init`, {
      method: 'POST',
      headers: { 'x-session-id': sessionId },
    });
    if (!res.ok) throw new Error('Failed to initialize user');
    return res.json();
  },

  getProfile: async () => {
    const sessionId = useUserStore.getState().sessionId;
    const res = await fetch(`${API_BASE}/user/profile`, {
      headers: { 'x-session-id': sessionId },
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  updateProfile: async (name: string) => {
    const sessionId = useUserStore.getState().sessionId;
    const res = await fetch(`${API_BASE}/user/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-session-id': sessionId,
      },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },
};
