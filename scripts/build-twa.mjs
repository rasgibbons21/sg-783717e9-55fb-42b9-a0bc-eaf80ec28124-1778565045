#!/usr/bin/env node
// Non-interactive TWA build script using bubblewrap core API
import { createRequire } from 'module';
import { createHash } from 'crypto';
import { readFile, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import { execSync } from 'child_process';

const require = createRequire('C:\\Users\\Roy\\AppData\\Roaming\\npm\\node_modules\\@bubblewrap\\cli\\');
const {
  TwaManifest, TwaGenerator, Config, JdkHelper, AndroidSdkTools,
  JarSigner, ConsoleLog
} = require('@bubblewrap/core');

const PROJECT_DIR = process.cwd();
const JDK_PATH = process.env.JAVA_HOME || 'C:/Users/Roy/jdk17/jdk-17.0.20+8';
const SDK_PATH = process.env.ANDROID_HOME || 'C:/Users/Roy/AppData/Local/Android/Sdk';
const MANIFEST_FILE = join(PROJECT_DIR, 'twa-manifest.json');

const log = new ConsoleLog('build', true);

function run(cmd, cwd) {
  console.log(`   > ${cmd}`);
  execSync(cmd, {
    cwd: cwd || PROJECT_DIR,
    stdio: 'inherit',
    env: {
      ...process.env,
      JAVA_HOME: JDK_PATH,
      ANDROID_HOME: SDK_PATH,
      PATH: `${JDK_PATH}/bin;${process.env.PATH}`,
    },
    shell: true,
  });
}

async function main() {
  console.log('=== Bloom TWA Build (v1.2.0) ===\n');

  // 1. Load twa-manifest
  console.log('1. Loading twa-manifest.json...');
  const twaManifest = await TwaManifest.fromFile(MANIFEST_FILE);
  console.log(`   Package: ${twaManifest.packageId}`);
  console.log(`   Version: ${twaManifest.appVersionName} (code ${twaManifest.appVersionCode})`);

  // 2. Setup tools
  console.log('\n2. Setting up JDK and Android SDK...');
  const config = new Config(JDK_PATH, SDK_PATH);
  const jdkHelper = new JdkHelper(process, config);
  const androidSdkTools = await AndroidSdkTools.create(process, config, jdkHelper, log);

  const hasBuildTools = await androidSdkTools.checkBuildTools();
  if (!hasBuildTools) {
    console.log('   Installing build tools...');
    await androidSdkTools.installBuildTools();
  }
  console.log('   Build tools OK');

  // 3. Generate TWA project
  console.log('\n3. Generating TWA Android project...');
  const twaGenerator = new TwaGenerator();
  try {
    await twaGenerator.removeTwaProject(PROJECT_DIR);
  } catch (e) {
    // OK if nothing to remove
  }
  await twaGenerator.createTwaProject(PROJECT_DIR, twaManifest, log);

  // Write manifest checksum
  const manifestContents = await readFile(MANIFEST_FILE);
  const checksum = createHash('sha1').update(manifestContents).digest('hex');
  await writeFile(join(PROJECT_DIR, 'manifest-checksum.txt'), checksum);
  console.log('   Project generated');

  // 4. Build using Gradle directly
  console.log('\n4. Building APK and App Bundle...');

  console.log('   Building APK...');
  run('.\\gradlew.bat assembleRelease --stacktrace');

  console.log('   Building App Bundle...');
  run('.\\gradlew.bat bundleRelease --stacktrace');

  // 5. Sign
  console.log('\n5. Signing with release key...');
  const signingKey = twaManifest.signingKey;
  const keystorePassword = 'KxOqlCPuZUce';
  const keyPassword = 'KxOqlCPuZUce';

  // Sign APK
  const apkUnsigned = resolve(PROJECT_DIR, 'app/build/outputs/apk/release/app-release-unsigned.apk');
  const apkSigned = resolve(PROJECT_DIR, 'app-release-signed.apk');
  await androidSdkTools.apksigner(
    `"${resolve(PROJECT_DIR, signingKey.path)}"`, `"${keystorePassword}"`,
    signingKey.alias, `"${keyPassword}"`,
    apkUnsigned, apkSigned
  );
  console.log(`   APK signed: app-release-signed.apk`);

  // Sign AAB
  const aabUnsigned = resolve(PROJECT_DIR, 'app/build/outputs/bundle/release/app-release.aab');
  const aabSigned = resolve(PROJECT_DIR, 'app-release-bundle.aab');
  const jarSigner = new JarSigner(jdkHelper);
  await jarSigner.sign(
    { ...signingKey, path: resolve(PROJECT_DIR, signingKey.path) },
    `"${keystorePassword}"`, `"${keyPassword}"`,
    aabUnsigned, aabSigned
  );
  console.log(`   AAB signed: app-release-bundle.aab`);

  console.log('\n=== Build complete ===');
  console.log('Upload app-release-bundle.aab to Google Play Console.');
}

main().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
