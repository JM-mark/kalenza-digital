const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  await p.goto('http://localhost:4321/pt/', { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
  console.log('media', await p.evaluate(() => [matchMedia('(hover: hover)').matches, matchMedia('(pointer: fine)').matches]));
  await p.evaluate(() => document.querySelector('#servicos').scrollIntoView()); await p.waitForTimeout(800);
  const bb = await (await p.$$('.sv'))[1].boundingBox();
  await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(900);
  console.log(await p.evaluate(() => { const c = document.querySelectorAll('.sv')[1]; const el = document.elementFromPoint(innerWidth*0.7, 400);
    return { hover: c.matches(':hover'), imgOp: getComputedStyle(c.querySelector('.sv__img')).opacity, tags: getComputedStyle(c.querySelector('.sv__tags')).opacity, top: document.elementFromPoint(0,0) && '', at: (()=>{const r=c.getBoundingClientRect(); const e=document.elementFromPoint(r.left+r.width/2, r.top+r.height/2); return e.outerHTML.slice(0,200) + ' | rect ' + JSON.stringify(e.getBoundingClientRect());})() }; }));
  await b.close();
})();
