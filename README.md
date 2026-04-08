# Welcome to Antigravity!

Welcome to your new developer home! Your Firebase Studio project has been successfully migrated to Antigravity.

Antigravity is our next-generation, agent-first IDE designed for high-velocity, autonomous development. Because Antigravity runs locally on your machine, you now have access to powerful local workflows and fully integrated AI editing capabilities that go beyond a cloud-based web IDE.

## Getting Started
- **Run Locally**: Use the **Run and Debug** menu on the left sidebar to start your local development server.
  - Or in a terminal run `npm run dev` and visit `http://localhost:9002`.
- **Deploy**: You can deploy your changes to Firebase App Hosting by using the integrated terminal and standard Firebase CLI commands, just as you did in Firebase Studio.
- **Cleanup**: Cleanup unused artifacts with the @cleanup workflow.

Enjoy the next era of AI-driven development!

File any bugs at https://github.com/firebase/firebase-tools/issues

**Firebase Studio Export Date:** 2026-03-30


---

## Previous README.md contents:


# ATLAS: Mobile & Web Integration Guide

This application is a **Hybrid Multi-Platform Environment** designed to run seamlessly on Web, Android, and iOS.

## 📱 Mobile Deployment (Android/iOS)

The mobile app is built using **Capacitor**, which wraps the Next.js web application into a native shell.

### How to Update the Mobile App
Because the native shell is configured to point to your live hosted URL, **you do not need to rebuild the native app for most changes.**

1.  **Web Changes**: Simply make changes to the code in this environment.
2.  **App Refresh**: On your mobile device, **close the app completely** and reopen it. The app will fetch the latest version of the website automatically.
3.  **Manual Sync (Native Features only)**: If you change native configuration (like the app name, icons, or permissions), you must run:
    ```bash
    npm run cap:sync
    ```
    Then, open the project in Android Studio or Xcode to rebuild the native binaries.

## 🌐 Progressive Web App (PWA)

ATLAS is fully PWA-compatible. On your Samsung or Android device:
1. Open the URL in Chrome.
2. Tap the **three dots (⋮)** in the top right.
3. Select **"Install App"** or **"Add to Home Screen"**.

The `public/sw.js` file handles updates and ensures the app can be launched directly from your home screen without a browser interface.

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Native Wrapper**: Capacitor 6
- **Database/Auth**: Firebase
- **AI**: Genkit + Gemini 1.5 Flash
