// Vídeo da Home (1440×900): intro da primeira visita, hero com o mouse mexendo e rolagem até o Contato.
//   node video.js  →  ../capturas/v2/home-pt-desktop.webm (depois converter com o ffmpeg do Playwright)
const fs = require('fs'); const path = require('path');
const { chromium } = require('playwright');
const OUT = path.join(__dirname, '..', 'capturas', 'v2');
const TMP = path.join(__dirname, 'video-tmp');
(async () => {
  fs.mkdirSync(TMP, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: TMP, size: { width: 1440, height: 900 } } });
  const p = await ctx.newPage(); // contexto novo: sessionStorage vazio, então a intro roda
  await p.mouse.move(720, 450);
  await p.goto('http://localhost:4321/pt/', { waitUntil: 'commit' });
  await p.waitForTimeout(2600);
  // hero: o mouse desenha uma curva para mostrar o parallax dos octógonos e o cursor
  const pts = [[720, 450], [1150, 300], [1250, 620], [900, 700], [520, 380], [980, 420]];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    for (let k = 1; k <= 30; k++) { const t = k / 30, e = t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2; await p.mouse.move(x0 + (x1 - x0) * e, y0 + (y1 - y0) * e); await p.waitForTimeout(16); }
    await p.waitForTimeout(150);
  }
  await p.mouse.move(1400, 880);
  await p.waitForTimeout(500);
  // rolagem real (roda do mouse), com paradas curtas em cada seção
  // o alvo é recalculado a cada passo: o pin do Processo (ScrollTrigger) muda as posições depois de carregar
  for (const sel of ['#sobre', '#servicos', '#projetos', '.work2', '#processo', '#por-que', '#contato']) {
    for (let guard = 0; guard < 2000; guard++) {
      const [cur, y, max] = await p.evaluate((s) => [scrollY, Math.round(document.querySelector(s).getBoundingClientRect().top + scrollY), document.documentElement.scrollHeight - innerHeight], sel);
      const to = Math.min(y, max);
      if (cur >= to - 2) break;
      await p.mouse.wheel(0, Math.min(45, to - cur)); await p.waitForTimeout(16);
    }
    await p.waitForTimeout(sel === '#contato' ? 2400 : 1100);
  }
  const vid = p.video();
  await ctx.close(); await b.close();
  const src = await vid.path(); const dst = path.join(OUT, 'home-pt-desktop.webm');
  fs.copyFileSync(src, dst); fs.rmSync(TMP, { recursive: true, force: true });
  console.log(dst);
})();
