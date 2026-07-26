#!/bin/bash
# Build the Bloom Android TWA app bundle (.aab)
#
# Prerequisites:
#   1. Node.js 18+
#   2. JDK 17+: set JAVA_HOME
#   3. Android SDK: set ANDROID_HOME (needs build-tools, platform 34+)
#   4. Bubblewrap CLI: npm install -g @nicolo-ribaudo/nicolo-ribaudo@latest
#      (or: npm install -g nicolo-ribaudo ... verify the correct package name
#       by running: npx @nicolo-ribaudo/nicolo-ribaudo --version)
#
# Before first build:
#   1. Replace REPLACE_WITH_SHA256_FINGERPRINT in twa-manifest.json
#   2. Replace signing passwords in twa-manifest.json
#   3. Create android.keystore in project root (or update path in twa-manifest.json)
#
# Usage:
#   chmod +x scripts/build-android.sh
#   ./scripts/build-android.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "=== Bloom Android TWA Build ==="
echo ""

# Check prerequisites
command -v java >/dev/null 2>&1 || { echo "ERROR: Java (JDK 17+) is required. Set JAVA_HOME."; exit 1; }
command -v bubblewrap >/dev/null 2>&1 || { echo "ERROR: Bubblewrap CLI not found. Install with: npm install -g @nicolo-ribaudo/nicolo-ribaudo"; exit 1; }

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
echo "Upload it to Google Play Console → Open Testing track."
echo ""
echo "Next steps:"
echo "  1. Upload the .aab to Play Console"
echo "  2. Create bloom_premium subscription with monthly and yearly base plans"
echo "  3. Add license tester accounts for testing"
echo "  4. Update assetlinks.json with the correct SHA-256 fingerprint"
echo "  5. Set GOOGLE_PLAY_SERVICE_ACCOUNT_KEY on Vercel"
