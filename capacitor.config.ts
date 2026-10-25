import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dotsandboxes.pro',
  appName: 'Dots & Boxes Pro',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
