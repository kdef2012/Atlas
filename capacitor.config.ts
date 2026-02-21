import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.playatlas.nebula',
  appName: 'ATLAS',
  webDir: 'public', // Using 'public' instead of 'out' because it always exists in NextJS
  server: {
    // Points the native app to your live production signal
    url: 'https://studio--owl-about-that-9f67d.us-central1.hosted.app/',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
