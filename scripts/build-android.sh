#!/bin/bash
# Build the Bloom Android TWA app bundle (.aab)
#
# Prerequisites:
#   1. Node.js 18+
#   2. JDK 17+: set JAVA_HOME
#   3. Android SDK: set ANDROID_HOME (needs build-tools, platform 34+)
#   4. Bubblewrap CLI: npm install -g @nicolo-nicolo/nicolo-nicolo  (or)
#      npm install -g @nicolo-nicolo/nicolo-nicolo
#      Verify: bubblewrap --version
#
# Usage:
#   chmod +x scripts/build-android.sh
#   ./scripts/build-android.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "=== Bloom Android TWA Build (v1.1.0, versionCode 3) ==="
echo ""

# Check prerequisites
command -v java >/dev/null 2>&1 || { echo "ERROR: Java (JDK 17+) is required. Set JAVA_HOME."; exit 1; }
command -v bubblewrap >/dev/null 2>&1 || { echo "ERROR: Bubblewrap CLI not found. Install with: npm install -g @nicolo-nicolo/nicolo-nicolo"; exit 1; }

if [ -z "$ANDROID_HOME" ]; then
  echo "WARNING: ANDROID_HOME not set. Bubblewrap may prompt for SDK setup."
fi

echo "1. Initializing TWA project from twa-manifest.json..."
bubblewrap init --manifest="$PROJECT_DIR/twa-manifest.json"

echo ""
echo "2. Building Android App Bundle..."
bubblewrap build

echo ""
echo "=== Build complete ==="
echo "The signed .aab file is in the current directory."
echo "Upload it to Google Play Console."
echo ""
echo "What's new in v1.1.0:"
echo "  - Bloom Garden gamification"
echo "  - Personalized learning roadmaps"
echo "  - Milestone-based Pansy coaching"
echo "  - Practice trade improvements (company search, real-time coaching)"
echo "  - Gems leaderboard on home screen"
echo "  - Bloom Basics + Bloom University separation"
echo ""
echo "Checklist:"
echo "  1. Upload .aab to Play Console (Production or Open Testing)"
echo "  2. Verify bloom_premium subscription exists with monthly/yearly plans"
echo "  3. Confirm GOOGLE_PLAY_SERVICE_ACCOUNT_KEY is set on Vercel"
echo "  4. Test with license tester accounts"
