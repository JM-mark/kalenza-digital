// Uma captura por seção da Home (desktop 1440 e celular 390), rolando até cada seção como um visitante.
//   node section_caps.js [pt|en|ar]  →  capturas/v2/{desktop|mobile}-NN-secao.png (PT) ou capturas/v2/{en|ar}/…
const fs = require('fs'); const path = require('path');
const { chromium } = require('playwright');
const LANG = process.argv[2] || 'pt';
const OUT = path.join(__dirname, '..', 'capturas', 'v2', ...(LANG === 'pt' ? [] : [LANG]));
const SECTIONS = [
  ['hero', '#inicio', 0], ['sobre', '#sobre', 0], ['servicos', '#servicos', 0], ['servicos-hover', '#servicos', 0, 'hover-sv'],
  ['projetos-faixa', '#projetos', 0], ['projetos', '.work2', 40], ['projetos-hover', '.work2', 40, 'hover-pj'],
  ['processo', '#processo', 'pin'], ['por-que', '#por-que', 0], ['contato', '#contato', 0], ['formulario-rodape', '.contact', 0],
];
const DEV = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  for (const [dev, opt] of Object.entries(DEV)) {
    const ctx = await b.newContext(opt);
    await ctx.addInitScript(() => sessionStorage.setItem('kz-intro', '1')); // sem a abertura nas capturas de seção
    const p = await ctx.newPage();
    await p.goto(`http://localhost:4321/${LANG}/`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1500);
    let n = 0;
    for (const [name, sel, off, action] of SECTIONS) {
      if (dev === 'mobile' && action) continue;          // hover não existe no toque
      const top = await p.evaluate(([s, o, d]) => {
        const el = document.querySelector(s); const y = el.getBoundingClientRect().top + scrollY;
        return o === 'pin' ? (d === 'desktop' ? y + innerHeight * 0.55 : y) : y - (o || 0);
      }, [sel, off, dev]);
      // rolagem em passos (os reveals e o ScrollTrigger reagem como numa rolagem real)
      await p.evaluate(async (to) => { const from = scrollY; for (let k = 1; k <= 10; k++) { scrollTo(0, from + (to - from) * k / 10); await new Promise(r => setTimeout(r, 30)); } }, top);
      await p.waitForTimeout(off === 'pin' ? 2600 : 1100);
      await p.evaluate((a) => document.documentElement.classList.toggle('cursor-hidden', !a), !!action);
      if (action === 'hover-sv') { const bb = await (await p.$$('.sv'))[1].boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(1200); }
      if (action === 'hover-pj') { const bb = await (await p.$$('.pj'))[0].boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + 150); await p.waitForTimeout(2300); }
      if (dev === 'desktop' && !action) { await p.mouse.move(1400, 880); await p.evaluate(() => document.documentElement.classList.add('cursor-hidden')); await p.waitForTimeout(450); } // mover o mouse reacende o cursor; esconde depois
      n++;
      await p.screenshot({ path: path.join(OUT, `${dev}-${String(n).padStart(2, '0')}-${name}.png`) });
    }
    console.log(dev, n, 'capturas');
    await ctx.close();
  }
  await b.close();
})();
