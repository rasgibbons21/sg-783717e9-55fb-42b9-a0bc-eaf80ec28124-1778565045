# Bloom iOS App Store Build Guide

## Prerequisites (Mac required)

- macOS with Xcode 15+ installed
- Apple Developer account ($99/year) — https://developer.apple.com
- CocoaPods: `sudo gem install cocoapods`
- Node.js 18+

## Setup Steps

### 1. Generate the iOS project

On the Mac, clone the repo and run:

```bash
npm install
npx cap add ios
```

This creates the `ios/` directory with a full Xcode project.

### 2. Open in Xcode

```bash
npx cap open ios
```

### 3. Configure signing

In Xcode:
1. Select the **App** target
2. Go to **Signing & Capabilities**
3. Set **Team** to your Apple Developer account
4. Set **Bundle Identifier** to `app.shebloomswealth.ios`
5. Xcode will auto-create the provisioning profile

### 4. App icons

Place the app icon (1024x1024 PNG, no alpha) in:
`ios/App/App/Assets.xcassets/AppIcon.appiconset/`

Use the existing `store_icon.png` or generate the set with:
https://www.appicon.co/

### 5. Splash screen

The Capacitor splash screen plugin is installed. Add a splash image:
- `ios/App/App/Assets.xcassets/Splash.imageset/splash.png`
- Or configure a storyboard launch screen in Xcode

### 6. Build and test

```bash
npx cap sync ios
```

Then in Xcode: **Product → Run** (on simulator or device).

### 7. Archive for App Store

1. In Xcode: **Product → Archive**
2. Once archived, click **Distribute App**
3. Choose **App Store Connect**
4. Upload

### 8. App Store Connect

At https://appstoreconnect.apple.com:
1. Create a new app with bundle ID `app.shebloomswealth.ios`
2. Fill in metadata:
   - **Name:** Bloom — Investing Education
   - **Subtitle:** Learn investing with Pansy AI
   - **Category:** Finance / Education
   - **Description:** (see below)
   - **Keywords:** investing, stocks, ETF, education, women, finance, learning
3. Upload screenshots (iPhone 6.7", 6.1", iPad)
4. Set pricing to **Free**
5. Submit for review

## App Store Description (draft)

**Bloom — Investing Education**

Learn investing with Pansy, your personal AI mentor. Bloom makes investing education approachable, starting from "What is a stock?" all the way to advanced strategies.

• 30 guided lessons from basics to advanced
• Practice trading with virtual money — no risk
• Real-time market data and stock research
• Pansy AI mentor for personalized guidance
• Track your progress from Seed to full Bloom

Bloom is for educational purposes only and does not constitute financial advice.

## Apple Review Tips

Apple may scrutinize web wrapper apps. Bloom should pass because:
- **AI mentor (Pansy)** provides interactive, personalized functionality
- **Practice trading** is a native-feeling interactive feature
- **Push notifications** capability is enabled
- **Offline awareness** via service worker
- The app provides substantial value beyond a website

If Apple requests changes, common asks:
- Add a native feature (push notifications are already set up)
- Improve the splash/loading experience
- Add proper error handling for offline state

## How the iOS app works

The iOS app is a native WKWebView wrapper that loads `https://shebloomswealth.app`. This is the same approach as the Android TWA — no static export needed. All API routes, SSR, and real-time data work because the app loads from Vercel.
