// Renders every app icon, favicon and splash from public/blossom-emblem.svg.
// Usage: node scripts/build-icons.mjs
import fs from "fs";
import sharp from "sharp";

const CREAM = "#F6F1E8";
const emblem = fs.readFileSync("public/blossom-emblem.svg");

/** The emblem centred on a square, at `scale` of its width, on cream or on transparent. */
async function render(size, { scale = 0.86, background = CREAM, rounded = false } = {}) {
  const inner = Math.round(size * scale);
  const flower = await sharp(emblem, { density: 600 }).resize(inner, inner).png().toBuffer();
  const base = sharp({ create: { width: size, height: size, channels: 4, background: background ?? { r: 0, g: 0, b: 0, alpha: 0 } } });
  let out = base.composite([{ input: flower, gravity: "center" }]);
  if (rounded) {
    const mask = Buffer.from(`<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${size * 0.22}" fill="#fff"/></svg>`);
    out = sharp(await out.png().toBuffer()).composite([{ input: mask, blend: "dest-in" }]);
  }
  return out.png().toBuffer();
}

/** A white, single-colour silhouette for Android's status-bar notification icon. */
async function silhouette(size) {
  const flower = await sharp(emblem, { density: 600 }).resize(size, size).ensureAlpha().extractChannel("alpha").toBuffer();
  return sharp({ create: { width: size, height: size, channels: 3, background: "#FFFFFF" } }).joinChannel(flower).png().toBuffer();
}

/** An .ico holding PNG images, which every modern browser reads. */
function ico(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  let offset = 6 + 16 * pngs.length;
  for (const { size, data } of pngs) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    entries.push(entry);
  }
  return Buffer.concat([header, ...entries, ...pngs.map((p) => p.data)]);
}

const write = (path, data) => {
  fs.writeFileSync(path, data);
  console.log("wrote", path);
};

// Web: manifest icons are "any maskable", so the flower stays inside the safe circle.
write("public/icon-192.png", await render(192, { scale: 0.74 }));
write("public/icon-512.png", await render(512, { scale: 0.74 }));
write("public/apple-touch-icon.png", await render(180, { scale: 0.8 }));
write("public/favicon.png", await render(32, { scale: 0.96, background: null }));
write("public/bloom-logo-mark.png", await render(512, { scale: 0.9, background: null }));
write(
  "public/favicon.ico",
  ico(await Promise.all([16, 32, 48].map(async (size) => ({ size, data: await render(size, { scale: 0.96, background: null }) })))),
);

// Trusted Web Activity (app/): launcher, maskable, splash and notification icons.
const densities = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
for (const [name, factor] of Object.entries(densities)) {
  const dir = `app/src/main/res`;
  if (!fs.existsSync(`${dir}/mipmap-${name}`)) continue;
  write(`${dir}/mipmap-${name}/ic_launcher.png`, await render(Math.round(48 * factor), { scale: 0.82, rounded: true }));
  write(`${dir}/mipmap-${name}/ic_maskable.png`, await render(Math.round(82 * factor), { scale: 0.7 }));
  if (fs.existsSync(`${dir}/drawable-${name}/splash.png`)) write(`${dir}/drawable-${name}/splash.png`, await render(Math.round(300 * factor), { scale: 0.6, background: null }));
  if (fs.existsSync(`${dir}/drawable-${name}/ic_notification_icon.png`)) write(`${dir}/drawable-${name}/ic_notification_icon.png`, await silhouette(Math.round(24 * factor)));
}

// Capacitor (android/): launcher icons.
for (const name of Object.keys(densities)) {
  const path = `android/app/src/main/res/mipmap-${name}/ic_launcher.png`;
  if (fs.existsSync(path)) write(path, await render(192, { scale: 0.82, rounded: true }));
}

// Social share image: the emblem with the name on cream.
{
  const flower = await sharp(emblem, { density: 600 }).resize(300, 300).png().toBuffer();
  const text = Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <text x="600" y="455" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="96" fill="#2E2B28">Bloom</text>
    <text x="600" y="510" text-anchor="middle" font-family="Georgia, serif" font-size="28" letter-spacing="8" fill="#6F6860">SHE BLOOMS WEALTH</text>
    <text x="600" y="565" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#6F6860">Learn stock analysis and grow your savings. Free.</text>
  </svg>`);
  const og = await sharp({ create: { width: 1200, height: 630, channels: 4, background: CREAM } })
    .composite([
      { input: flower, top: 50, left: 450 },
      { input: text, top: 0, left: 0 },
    ])
    .png()
    .toBuffer();
  write("public/og-image.png", og);
}
