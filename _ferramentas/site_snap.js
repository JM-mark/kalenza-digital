// Capturas do site: quadros de tela inteira descendo a página (como um visitante), para revisão.
//   node site_snap.js pt [desktop|mobile]
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const { serve } = require('./sites');
const DEV = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
(async () => {
  const [lang = 'pt', ...rest] = process.argv.slice(2); const sub = (rest.find(a => a.includes('/')) || ''); const devs = rest.filter(a => !a.includes('/')); const tag = sub ? sub.split('/').join('-').replace(/-$/, '') + '-' : '';
  const root = path.join(__dirname, '..', 'dist');
  const srv = await serve(root);
  const base = `http://localhost:${srv.address().port}/${lang}/${sub}`;
  const out = path.join(__dirname, 'site-shots'); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  for (const dev of devs.length ? devs : ['desktop', 'mobile']) {
    const ctx = await b.newContext(DEV[dev]);
    const page = await ctx.newPage();
    const errs = [];
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    page.on('pageerror', e => errs.push(String(e)));
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2600);
    const vh = DEV[dev].viewport.height;
    let i = 0, y = 0;
    fs.readdirSync(out).filter(f => f.startsWith(`${lang}-${tag}${dev}-`)).forEach(f => fs.unlinkSync(path.join(out, f)));
    while (true) {
      await page.screenshot({ path: path.join(out, `${lang}-${tag}${dev}-${String(i).padStart(2, '0')}.png`) });
      const h = await page.evaluate(() => document.documentElement.scrollHeight);
      if (y + vh >= h - 2) break;
      y += Math.round(vh * 0.85);
      // rolagem suave em passos, para o ScrollTrigger e os reveals reagirem como num navegador
      await page.evaluate(async (to) => { const from = scrollY; for (let k = 1; k <= 8; k++) { scrollTo(0, from + (to - from) * k / 8); await new Promise(r => setTimeout(r, 40)); } }, y);
      await page.waitForTimeout(1800);
      i++;
    }
    console.log(dev, 'frames', i + 1, 'height', await page.evaluate(() => document.documentElement.scrollHeight), errs.length ? 'ERRORS: ' + errs.join(' | ') : 'no console errors');
    await ctx.close();
  }
  await b.close(); srv.close();
})();
