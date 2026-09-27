// Página inteira de cada demo (1440px), com os reveals disparados e o fundo fixo esticado,
// para a prévia com rolagem automática nos cards de projeto do site.
const fs = require('fs'); const path = require('path');
const { chromium } = require('playwright'); const { serve, settle } = require('./sites');
(async () => {
  const out = path.join(__dirname, 'demo-full'); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  for (const name of ['marvessa', 'ambrevel', 'ondessa', 'ardelis']) {
    const srv = await serve(path.join(__dirname, '..', '_demos', name));
    const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    await p.goto(`http://localhost:${srv.address().port}/`, { waitUntil: 'networkidle' });
    await settle(p);
    await p.addStyleTag({ content: `.stage-bg .sticky{position:absolute!important;inset:0;height:100%!important}
      .wa-float,.wa,.whatsapp-pulse,a[aria-label="Agendar"].fixed{display:none!important}
      .reveal,.fade-up,.rv,[data-split],.will{opacity:1!important;transform:none!important}
      .split .w{opacity:1!important;transform:none!important;animation:none!important}` });
    await p.waitForTimeout(600);
    await p.screenshot({ path: path.join(out, `${name}.png`), fullPage: true });
    console.log(name, await p.evaluate(() => document.documentElement.scrollHeight));
    await ctx.close(); srv.close();
  }
  await b.close();
})();
