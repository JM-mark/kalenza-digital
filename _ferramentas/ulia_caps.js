// Capturas do site da Ülia Media (versão animada, pedida pelo usuário em 26/09/2026) no mesmo padrão das demos:
//   ulia-hero-{800,1600}, ulia-m-480, ulia-full-720 (prévia com rolagem) e ulia-{sobre,servicos}-1400.
//   node ulia_caps.js  →  ulia-shots/*.png  (depois: python ulia_assets.py)
const fs = require('fs'); const path = require('path');
const { chromium } = require('playwright');
const URL = process.env.ULIA_URL || 'https://animations-ulia-media.ulia-media.workers.dev/';
const OUT = path.join(__dirname, 'ulia-shots');
const HIDE = '.ulia-whatsapp{display:none!important}';
async function open(b, opt) {
  const ctx = await b.newContext(opt); const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(2000); // o vídeo em loop impede o networkidle
  await p.addStyleTag({ content: HIDE });
  // rola a página inteira para carregar imagens preguiçosas e disparar qualquer reveal
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 500) { await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(90); }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(2500); // o vídeo do hero precisa de tempo para aparecer
  return { ctx, p };
}
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  // capa (1440×900 a 2x → 1600×1000)
  let { ctx, p } = await open(b, { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await p.screenshot({ path: path.join(OUT, 'hero.png') });
  // seções: rola até a seção, esconde o cabeçalho flutuante e captura a seção inteira
  await p.addStyleTag({ content: '.ulia-site-header{visibility:hidden!important}' });
  for (const id of ['sobre', 'servicos']) {
    const y = await p.evaluate((id) => document.getElementById(id).getBoundingClientRect().top + scrollY, id);
    await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(1500);
    await (await p.$(`#${id}`)).screenshot({ path: path.join(OUT, `${id}.png`) });
  }
  await ctx.close();
  // página inteira montada por telas (o modo fullPage lava os fundos fixos em vídeo), a 1x, até o corte
  ({ ctx, p } = await open(b, { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }));
  const CORTE = +(process.env.ULIA_CORTE || 4335);
  const tiles = [];
  for (let y = 0; y < CORTE; y += 900) {
    await p.evaluate((y) => scrollTo(0, y), y); await p.waitForTimeout(1300);
    if (y === 900) { await p.addStyleTag({ content: '.ulia-site-header{visibility:hidden!important}' }); await p.waitForTimeout(200); }
    const f = path.join(OUT, `tile-${String(y).padStart(5, '0')}.png`); await p.screenshot({ path: f });
    tiles.push([f, await p.evaluate(() => scrollY)]);
  }
  fs.writeFileSync(path.join(OUT, 'tiles.json'), JSON.stringify(tiles));
  await ctx.close();
  // celular (390×844 a 2x → 480×1039)
  ({ ctx, p } = await open(b, { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }));
  await p.screenshot({ path: path.join(OUT, 'mobile.png') });
  await ctx.close();
  await b.close();
  console.log(fs.readdirSync(OUT).join(' '));
})();
