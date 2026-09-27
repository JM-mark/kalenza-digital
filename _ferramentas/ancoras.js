// Fail-safe das entradas: clica em cada link do menu (e rola rápido pela página) e procura elementos
// que estão na tela mas continuam invisíveis (opacity < 0.9 ou recortados).
//   node ancoras.js [pt|en|ar]
const { chromium } = require('playwright');
const LANG = process.argv[2] || 'pt';
const HIDDEN = () => {
  const out = [];
  document.querySelectorAll('[data-split], [data-reveal], .aperture, [data-in]').forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.bottom < 40 || r.top > innerHeight - 40 || r.height === 0) return;
    const step = el.closest('.proc.is-pinned .step');
    if (step && +getComputedStyle(step).opacity < 0.5) return; // etapa fora de vez no Processo fixado
    const cs = getComputedStyle(el);
    const words = el.matches('[data-split]') ? [...el.querySelectorAll('.w')].some((w) => +getComputedStyle(w).opacity < 0.9) : false;
    if (+cs.opacity < 0.9 || words || (el.classList.contains('aperture') && !el.classList.contains('is-in')))
      out.push((el.id || el.className.toString().slice(0, 40)) + ' @' + Math.round(r.top));
  });
  return out;
};
(async () => {
  const b = await chromium.launch();
  let falhas = 0;
  for (const [dev, opt] of [['desktop', { viewport: { width: 1440, height: 900 } }], ['mobile', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
    const ctx = await b.newContext(opt);
    await ctx.addInitScript(() => sessionStorage.setItem('kz-intro', '1'));
    const p = await ctx.newPage();
    const ids = ['sobre', 'servicos', 'projetos', 'processo', 'contato'];
    for (const id of ids) {
      await p.goto(`http://localhost:4321/${LANG}/`, { waitUntil: 'networkidle' });
      await p.waitForTimeout(400);
      if (dev === 'desktop') await p.click(`.hdr__nav a[href$="#${id}"]`);
      else { await p.click('.hdr__burger'); await p.waitForTimeout(500); await p.click(`.menu__nav a[href$="#${id}"]`); }
      await p.waitForTimeout(1500); // animações terminam em até ~0,8 s
      const h = await p.evaluate(HIDDEN);
      if (h.length) falhas++;
      console.log(dev, '#' + id, h.length ? 'INVISÍVEIS: ' + h.join(', ') : 'ok');
    }
    // rolagem rápida: pula para o fim e volta ao meio, conferindo cada tela
    await p.goto(`http://localhost:4321/${LANG}/`, { waitUntil: 'networkidle' });
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    for (const y of [H, H * 0.55, H * 0.3, H * 0.8]) {
      await p.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), y);
      await p.waitForTimeout(1500);
      const h = await p.evaluate(HIDDEN);
      if (h.length) falhas++;
      console.log(dev, 'salto y=' + Math.round(y), h.length ? 'INVISÍVEIS: ' + h.join(', ') : 'ok');
    }
    await ctx.close();
  }
  await b.close();
  console.log(falhas ? `${falhas} falha(s)` : 'tudo visível');
})();
