# Bloom App Store Build Guide

## No Mac? Use Codemagic (Recommended)

Codemagic provides cloud Mac build machines — no Mac needed.

### Step 1: Apple Developer Account

Sign up at https://developer.apple.com ($99/year). This is required for any iOS app.

### Step 2: Codemagic Setup

1. Sign up at https://codemagic.io (free tier: 500 build mins/month)
2. Connect your GitLab repo (`cinder-vault-enterprises-llc-group/sbw-production`)
3. Codemagic will auto-detect the `codemagic.yaml` in the repo

### Step 3: Add Credentials in Codemagic

In Codemagic dashboard → Settings → Environment variables, create a group called `apple_credentials`:

- **APP_STORE_CONNECT_KEY_IDENTIFIER** — from App Store Connect → Users → Keys
- **APP_STORE_CONNECT_ISSUER_ID** — same page
- **APP_STORE_CONNECT_PRIVATE_KEY** — download the .p8 key file, paste contents
- **CERTIFICATE_PRIVATE_KEY** — generate via Codemagic's code signing docs

For Android, create a group called `android_credentials`:
- **GCLOUD_SERVICE_ACCOUNT_CREDENTIALS** — Google Play service account JSON
- **CM_KEYSTORE** — base64-encoded signing.keystore
- **CM_KEYSTORE_PASSWORD** — keystore password
- **CM_KEY_ALIAS** — `my-key-alias`
- **CM_KEY_PASSWORD** — key password

### Step 4: Build

Click "Start new build" in Codemagic. It will:
1. Spin up a Mac with Xcode
2. Install dependencies
3. Generate the iOS project via Capacitor
4. Build and sign the app
5. Upload to TestFlight automatically

### Step 5: App Store Connect

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
