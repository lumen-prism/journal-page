// node render.mjs --scene=<scenes/ 下的文件名> [--seed=5] [--out=out/x.png]   （在 skill 目录里跑）
// 要 puppeteer-core（本目录 npm i puppeteer-core）和一个 Chrome：Mac 自带的、playwright 下载的 chromium，或 CHROME_PATH。
import { createRequire } from 'node:module';
import { writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
import { homedir } from 'node:os';

let puppeteer;
for (const base of [import.meta.url]) {
  try { puppeteer = createRequire(base)('puppeteer-core'); break; } catch {}
}
if (!puppeteer) { console.error('puppeteer-core not found: npm install puppeteer-core'); process.exit(1); }
const pw = `${homedir()}/.cache/ms-playwright`;
const CHROME = [process.env.CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ...(existsSync(pw) ? readdirSync(pw).filter(n => /^chromium-\d+$/.test(n)).sort().reverse().flatMap(n => [`${pw}/${n}/chrome-linux/chrome`, `${pw}/${n}/chrome-linux64/chrome`]) : []),
].find(p => p && existsSync(p));
if (!CHROME) { console.error('Chrome not found: set CHROME_PATH'); process.exit(1); }
const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const here = new URL('.', import.meta.url).pathname;
const page_ = resolve(here, 'page.html'), scene = args.scene || 'rainy_sunday', seed = args.seed || 5, out = args.out || resolve(here, `out/${scene}.png`);

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: true, args: ['--allow-file-access-from-files', '--no-sandbox'],
});
try {
  const page = await browser.newPage();
  page.on('console', m => console.log('[page]', m.text()));
  page.on('pageerror', e => console.error('[pageerror]', e.message));
  await page.setViewport({ width: 1080, height: 1440 });
  await page.goto(pathToFileURL(page_).href + `?scene=${scene}&seed=${seed}`);
  await page.waitForFunction('window.DONE === true || window.FAIL', { timeout: 300000, polling: 500 });
  const fail = await page.evaluate(() => window.FAIL);
  if (fail) throw new Error(fail);
  const url = await page.evaluate(() => document.getElementById('out').toDataURL('image/png'));
  mkdirSync(dirname(resolve(out)), { recursive: true });
  writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
  console.log('wrote ' + out);
} finally {
  await browser.close();
}
