const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const p = await b.newPage({ viewport: vp });
    await p.goto('http://localhost:4321/pt/', { waitUntil: 'networkidle' });
    await p.waitForTimeout(800);
    const r = await p.evaluate(() => [...document.querySelectorAll('main > *, footer')].map(e => (e.id || e.className.split(' ').slice(0, 2).join('.')) + ':' + Math.round(e.getBoundingClientRect().height)));
    const pin = await p.evaluate(() => { const s = document.querySelector('.pin-spacer'); return s ? Math.round(s.getBoundingClientRect().height) : 0; });
    console.log(vp.width, await p.evaluate(() => document.documentElement.scrollHeight), 'pin-spacer', pin, '\n ', r.join('  '));
    await p.close();
  }
  await b.close();
})();
