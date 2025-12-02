import { useUserStore } from './userContext';
import { getApiBaseUrl } from './platform';

const getApiBase = () => getApiBaseUrl();

function getAuthHeader(): Record<string, string> {
  const token = useUserStore.getState().token;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const userApi = {
  register: async (username: string, password: string, name?: string) => {
    const res = await fetch(`${getApiBase()}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, name }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Registration failed');
    }
    return res.json();
  },

  login: async (username: string, password: string) => {
    const res = await fetch(`${getApiBase()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Login failed');
    }
    return res.json();
  },

  getProfile: async () => {
    const res = await fetch(`${getApiBase()}/user/profile`, {
      headers: getAuthHeader(),
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  updateProfile: async (name: string) => {
    const res = await fetch(`${getApiBase()}/user/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },
};
