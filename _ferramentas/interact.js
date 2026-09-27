// Capturas dirigidas: intro (quadros), hero, hover de serviço, hover de projeto (rolagem), cursor.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  const t0 = Date.now();
  await p.goto('http://localhost:4321/pt/', { waitUntil: 'commit' });
  for (const ms of [150, 450, 750, 1000, 1400]) {
    const w = ms - (Date.now() - t0); if (w > 0) await p.waitForTimeout(w);
    await p.screenshot({ path: `site-shots/i-intro-${ms}.png` });
  }
  await p.waitForTimeout(1500);
  await p.mouse.move(1100, 420); await p.waitForTimeout(1600);
  await p.screenshot({ path: 'site-shots/i-hero.png' });
  // serviço em hover
  await p.evaluate(() => document.querySelector('#servicos').scrollIntoView()); await p.waitForTimeout(900);
  const sv = await p.$$('.sv'); const bb = await sv[1].boundingBox();
  await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(1300);
  await p.screenshot({ path: 'site-shots/i-servico-hover.png' });
  // projeto em hover: antes e durante a rolagem
  await p.evaluate(() => window.scrollTo(0, document.querySelector('.work2').offsetTop + 60)); await p.waitForTimeout(1200);
  const pj = await p.$$('.pj'); const pb = await pj[1].boundingBox();
  await p.mouse.move(pb.x + pb.width / 2, pb.y + 200); await p.waitForTimeout(2600);
  await p.screenshot({ path: 'site-shots/i-projeto-hover.png' });
  const info = await p.evaluate(() => { const c = document.querySelectorAll('.pj')[1]; return [c.style.getPropertyValue('--scroll'), c.style.getPropertyValue('--dur'), document.documentElement.className]; });
  console.log(info);
  await b.close();
})();
