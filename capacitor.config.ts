import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dailyflow.reminder',
  appName: 'DailyFlow',
  webDir: 'dist/public',
  server: {
    url: 'https://reminder-shine.onrender.com',
    cleartext: false,
    androidScheme: 'https',
    iosScheme: 'https',
    allowNavigation: ['reminder-shine.onrender.com', '*.onrender.com']
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: true,
    useLegacyBridge: false
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#8B7FFF',
      sound: 'alarm'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#F5EDD8',
      showSpinner: false
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#8B7FFF'
    }
  }
};

export default config;
