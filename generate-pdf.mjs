import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.resolve(__dirname, 'public', 'ebooks', 'From-Broke-to-Blooming.pdf');

async function generatePDF() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log('Navigating to ebook-premium...');
  await page.goto('http://localhost:3000/ebook-premium', { waitUntil: 'networkidle0', timeout: 30000 });

  console.log('Generating PDF...');
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });

  console.log('PDF saved to:', outputPath);
  await browser.close();
  console.log('Done!');
}

generatePDF().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
