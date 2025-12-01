import { useEffect } from 'react';
import { useUserStore } from '@/lib/userContext';
import { userApi } from '@/lib/userApi';

export function useInitUser() {
  useEffect(() => {
    const init = async () => {
      try {
        const user = await userApi.init();
        useUserStore.getState().setUserName(user.name);
      } catch (error) {
        console.error('Failed to initialize user:', error);
      }
    };
    
    init();
  }, []);
}
