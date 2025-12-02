import { Capacitor } from '@capacitor/core';

export const isNativeApp = (): boolean => {
  return Capacitor.isNativePlatform();
};

export const getPlatform = (): 'android' | 'ios' | 'web' => {
  return Capacitor.getPlatform() as 'android' | 'ios' | 'web';
};

export const getApiBaseUrl = (): string => {
  if (isNativeApp()) {
    return 'https://reminder-shine.onrender.com/api';
  }
  return '/api';
};

export const getBaseUrl = (): string => {
  if (isNativeApp()) {
    return 'https://reminder-shine.onrender.com';
  }
  return '';
};
