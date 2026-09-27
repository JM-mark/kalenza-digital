// Quando o título do hero fica visível: primeira visita (com intro) e visita seguinte (sem intro).
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  for (const [label, seen, reduce] of [['1a visita (intro)', false, false], ['visita seguinte', true, false], ['movimento reduzido', false, true]]) {
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: reduce ? 'reduce' : 'no-preference' });
    if (seen) await ctx.addInitScript(() => sessionStorage.setItem('kz-intro', '1'));
    const p = await ctx.newPage();
    await p.goto('http://localhost:4321/pt/', { waitUntil: 'commit' });
    const t = await p.evaluate(() => new Promise((res) => {
      const t0 = performance.timeOrigin; const out = {};
      const check = () => {
        const now = Math.round(performance.now());
        const words = [...document.querySelectorAll('#hero-title .w')];
        const intro = document.querySelector('.intro-screen');
        const cover = intro && getComputedStyle(intro).display !== 'none' && getComputedStyle(intro).visibility !== 'hidden';
        const vis = words.length && words.every(w => +getComputedStyle(w).opacity > 0.98);
        const cta = document.querySelector('.hero__ctas'); const ctaVis = cta && +getComputedStyle(cta).opacity > 0.98;
        if (vis && !out.title) out.title = now;
        if (ctaVis && !out.ctas) out.ctas = now;
        if (!cover && out.coverGone === undefined) out.coverGone = now;
        if (out.title && out.ctas && out.coverGone !== undefined) return res(out);
        if (now > 5000) return res(out);
        requestAnimationFrame(check);
      };
      requestAnimationFrame(check);
    }));
    console.log(label.padEnd(20), 'título 100%:', t.title, 'ms · botões 100%:', t.ctas, 'ms · tela de abertura some:', t.coverGone, 'ms');
    await ctx.close();
  }
  await b.close();
})();
