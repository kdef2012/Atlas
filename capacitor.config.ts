import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.playatlas.nebula',
  appName: 'ATLAS',
  webDir: 'public', // Set to a directory that always exists to satisfy CLI
  server: {
    // Points the native app to your live production URL
    url: 'https://studio--owl-about-that-9f67d.us-central1.hosted.app/',
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
