import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const lighthouse = (await import('file:///C:/Users/Jaafar/AppData/Local/npm-cache/_npx/8003d8991b0d346b/node_modules/lighthouse/core/index.js')).default;
const url = process.argv[2], form = process.argv[3] || 'mobile';
const b = await chromium.launch({ args: ['--remote-debugging-port=9333'] });
const cfg = form === 'desktop'
  ? { extends: 'lighthouse:default', settings: { formFactor: 'desktop', screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 } } }
  : { extends: 'lighthouse:default' };
const r = await lighthouse(url, { port: 9333, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'seo', 'best-practices'] }, cfg);
const lhr = r.lhr;
console.log(form, Object.fromEntries(Object.entries(lhr.categories).map(([k, v]) => [k, Math.round(v.score * 100)])));
for (const a of Object.values(lhr.audits)) if (a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== 'informative' && a.scoreDisplayMode !== 'manual') console.log('  -', a.id, a.score, a.displayValue || '');
fs.writeFileSync('lh-' + form + '.json', JSON.stringify(lhr));
await b.close();
