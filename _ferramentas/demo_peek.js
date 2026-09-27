// Prévia: página inteira (reveals disparados) de uma demo, desktop e mobile.  node demo_peek.js ardelis
const path = require('path'); const { chromium } = require('playwright'); const { serve, settle } = require('./sites');
(async () => {
  const name = process.argv[2]; const srv = await serve(path.join(__dirname, '..', '_demos', name));
  const url = `http://localhost:${srv.address().port}/`; const b = await chromium.launch();
  for (const [dev, o] of [['d', { viewport: { width: 1440, height: 900 } }], ['m', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
    const ctx = await b.newContext(o); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(String(e))); p.on('requestfailed', r => errs.push('FAIL ' + r.url()));
    await p.goto(url, { waitUntil: 'networkidle' }); await settle(p); await p.waitForTimeout(600);
    await p.screenshot({ path: `demo-peek/${name}-${dev}.png`, fullPage: true });
    console.log(name, dev, errs.length ? errs.join(' | ') : 'ok'); await ctx.close();
  }
  await b.close(); srv.close();
})();
