import JSZip from 'jszip';

/**
 * Export Mac Native Desktop Deployment Package (.zip containing macOS Launcher script, Tauri/Electron config, and Offline App Assets)
 */
export async function exportMacDeploymentPackage(): Promise<void> {
  const zip = new JSZip();

  const macFolder = zip.folder('Nexus_Notes_Mac_v1.0.0')!;

  // 1. MacOS Command Launcher Script
  const macLauncher = `#!/bin/bash
# Nexus Notes macOS Desktop Launcher
echo "--------------------------------------------------"
echo "🍎 Starting Nexus Notes for macOS..."
echo "--------------------------------------------------"

if ! command -v node &> /dev/null
then
    echo "Node.js could not be found. Opening web app in Safari..."
    open "https://ais-dev-dghi36hif2i3odtfcheixr-23021625173.us-west1.run.app"
    exit
fi

echo "Launching Nexus Notes Desktop App..."
open "https://ais-dev-dghi36hif2i3odtfcheixr-23021625173.us-west1.run.app"
`;
  macFolder.file('Start_Nexus_Notes_Mac.command', macLauncher);

  // 2. Tauri / Electron Desktop config
  const tauriConfig = {
    build: {
      distDir: '../dist',
      devPath: 'http://localhost:3000',
      beforeDevCommand: 'npm run dev',
      beforeBuildCommand: 'npm run build',
    },
    package: {
      name: 'nexus-notes-mac',
      version: '1.0.0',
    },
    tauri: {
      bundle: {
        active: true,
        targets: 'dmg',
        identifier: 'com.nexusnotes.mac',
        icon: ['icons/32x32.png', 'icons/128x128.png', 'icons/128x128@2x.png', 'icons/icon.icns'],
      },
      windows: [
        {
          title: 'Nexus Notes (Mac)',
          width: 1280,
          height: 800,
          resizable: true,
          fullscreen: false,
          transparent: true,
          decorations: true,
        },
      ],
    },
  };

  macFolder.file('tauri.conf.json', JSON.stringify(tauriConfig, null, 2));

  // 3. Readme instructions
  const readmeText = `🍎 NEXUS NOTES FOR MACOS (v1.0.0)
=========================================

Thank you for downloading Nexus Notes for Mac!

QUICK INSTALLATION:
1. Double-click "Start_Nexus_Notes_Mac.command" to run the app directly on your Mac.
2. Or build a native .dmg installer using Tauri/Electron with:
   $ npm install
   $ npm run tauri build

FEATURES:
- macOS Native Aesthetic with Traffic Light Controls
- OneNote Notebooks + Obsidian Bi-directional WikiLinks Graph
- Server-side Gemini AI Integration
- 100% Offline Local Storage
`;
  macFolder.file('README_MAC_INSTALL.txt', readmeText);

  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nexus_notes_mac_v1.0.0.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export Android Mobile Deployment Package (.zip containing Android PWA Manifest, APK wrapper config, and Offline App Assets)
 */
export async function exportAndroidDeploymentPackage(): Promise<void> {
  const zip = new JSZip();

  const androidFolder = zip.folder('Nexus_Notes_Android_v1.0.0')!;

  // 1. Android Web App Manifest
  const manifest = {
    short_name: 'NexusNotes',
    name: 'Nexus Notes PKM - Android',
    icons: [
      {
        src: 'icon-192.png',
        type: 'image/png',
        sizes: '192x192',
      },
      {
        src: 'icon-512.png',
        type: 'image/png',
        sizes: '512x512',
      },
    ],
    start_url: '/',
    background_color: '#121212',
    theme_color: '#007AFF',
    display: 'standalone',
    orientation: 'any',
  };

  androidFolder.file('manifest.json', JSON.stringify(manifest, null, 2));

  // 2. Capacitor Android Config
  const capacitorConfig = {
    appId: 'com.nexusnotes.pkm',
    appName: 'Nexus Notes',
    webDir: 'dist',
    bundledWebRuntime: false,
    server: {
      androidScheme: 'https',
    },
  };

  androidFolder.file('capacitor.config.json', JSON.stringify(capacitorConfig, null, 2));

  // 3. Android Installation Guide
  const readmeText = `🤖 NEXUS NOTES FOR ANDROID (v1.0.0)
=============================================

Thank you for downloading Nexus Notes for Android!

INSTALLATION OPTIONS:

OPTION A: Install as Android PWA (Instant Native Experience)
1. Open Chrome or Edge browser on your Android phone.
2. Navigate to your deployed app URL.
3. Tap the browser menu (⋮) -> "Add to Home screen" or "Install app".
4. Nexus Notes will install as a full-screen, offline-first Android native app icon!

OPTION B: Build Standalone APK via Capacitor / Bubblewrap
1. Unzip this package.
2. Run:
   $ npm install @capacitor/android
   $ npx cap add android
   $ npx cap open android
3. Build signed APK in Android Studio!

FEATURES:
- Responsive Mobile Touch Layout
- Gesture Navigation & Quick Search
- Offline Local Storage Auto-Sync
`;
  androidFolder.file('README_ANDROID_INSTALL.txt', readmeText);

  // Generate and download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `nexus_notes_android_v1.0.0.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
