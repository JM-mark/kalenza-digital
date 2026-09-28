// Imagens de compartilhamento (Open Graph, 1200x630) e ícones do site, renderizados com as fontes da marca.
//   node og_imagens.js  →  public/og/og-{pt,en,ar}.jpg, public/apple-touch-icon.png, public/favicon-32.png, public/favicon.ico
const fs = require('fs'); const path = require('path');
const { chromium } = require('playwright');
const ROOT = path.join(__dirname, '..');
const PUB = path.join(ROOT, 'public');
const font = (f) => 'file:///' + path.join(PUB, 'fonts', f).replace(/\\/g, '/');
const svg = (f) => fs.readFileSync(path.join(PUB, 'img', f), 'utf8');

const T = {
  pt: { dir: 'ltr', a: 'Marcas desenhadas', b: 'para serem escolhidas.', sub: 'Sites · Identidade visual · Design · Estratégia de marketing' },
  en: { dir: 'ltr', a: 'Brands designed', b: 'to be chosen.', sub: 'Websites · Brand identity · Design · Marketing strategy' },
  ar: { dir: 'rtl', a: 'علامات تجارية صُمّمت', b: 'لتكون الخيار الأول.', sub: 'مواقع إلكترونية · هوية بصرية · تصميم · استراتيجيات تسويق' },
};

const octo = (r, c = 300) => 'M' + Array.from({ length: 8 }, (_, k) => {
  const a = ((22.5 + 45 * k) * Math.PI) / 180;
  return `${(c + r * Math.cos(a)).toFixed(1)} ${(c + r * Math.sin(a)).toFixed(1)}`;
}).join(' L') + ' Z';

function page(lang) {
  const t = T[lang]; const ar = lang === 'ar';
  const rings = [[286, .9], [222, .55], [158, .35], [96, .7]].map(([r, o]) => `<path d="${octo(r)}" fill="none" stroke="#B89B72" stroke-width="1.6" opacity="${o}"/>`).join('');
  return `<!doctype html><html lang="${lang}" dir="${t.dir}"><head><meta charset="utf-8"><style>
@font-face{font-family:Prata;src:url('${font('prata.woff2')}')}
@font-face{font-family:NSD;src:url('${font('nsd-italic-400.woff2')}');font-style:italic}
@font-face{font-family:Albert;src:url('${font('albert-sans.woff2')}');font-weight:100 900}
@font-face{font-family:Reem;src:url('${font('reem-kufi.woff2')}');font-weight:400 700}
@font-face{font-family:Plex;src:url('${font('plex-arabic-regular.woff2')}')}
html,body{margin:0;width:1200px;height:630px;background:#10151F;overflow:hidden}
body{position:relative;background:radial-gradient(60% 80% at ${ar ? '22%' : '78%'} 40%,rgba(184,155,114,.16),transparent 70%),#10151F}
.art{position:absolute;top:50%;${ar ? 'left' : 'right'}:60px;width:440px;height:440px;transform:translateY(-50%)}
.logo{position:absolute;top:64px;${ar ? 'right' : 'left'}:80px;width:250px;color:#F4EFE6}
.logo svg{width:100%;height:auto;display:block}
.txt{position:absolute;${ar ? 'right' : 'left'}:80px;bottom:92px;width:660px}
h1{margin:0;font:400 ${ar ? 64 : 76}px/${ar ? 1.3 : .98} ${ar ? 'Reem' : 'Prata'};color:#F4EFE6;letter-spacing:${ar ? 0 : '-.02em'}}
h1 i{display:block;font:${ar ? 'normal 400' : 'italic 400'} ${ar ? 64 : 73}px/${ar ? 1.3 : 1.02} ${ar ? 'Reem' : 'NSD'};color:#B89B72}
p{margin:26px 0 0;font:500 20px/1.4 ${ar ? 'Plex' : 'Albert'};color:rgba(244,239,230,.72);letter-spacing:${ar ? 0 : '.01em'}}
.line{position:absolute;left:0;right:0;bottom:0;height:6px;background:#B89B72}
</style></head><body>
<svg class="art" viewBox="0 0 600 600">${rings}<text x="300" y="300" text-anchor="middle" dominant-baseline="central" font-family="Prata" font-size="150" fill="#B89B72">K</text></svg>
<div class="logo">${svg('kalenza-logo-horizontal_fundo-escuro.svg')}</div>
<div class="txt"><h1>${t.a}<i>${t.b}</i></h1><p>${t.sub}</p></div>
<div class="line"></div></body></html>`;
}

(async () => {
  fs.mkdirSync(path.join(PUB, 'og'), { recursive: true });
  const tmp = path.join(__dirname, 'og-tmp.html');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
  for (const lang of Object.keys(T)) {
    fs.writeFileSync(tmp, page(lang));
    await p.goto('file:///' + tmp.replace(/\\/g, '/')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(PUB, 'og', `og-${lang}.jpg`), type: 'jpeg', quality: 86 });
    console.log('og', lang);
  }
  // ícones a partir do favicon.svg (monograma K no octógono sobre Noite)
  const fav = 'file:///' + path.join(PUB, 'favicon.svg').replace(/\\/g, '/');
  for (const [size, name] of [[180, 'apple-touch-icon.png'], [32, 'favicon-32.png'], [48, 'favicon-48.png']]) {
    const q = await b.newPage({ viewport: { width: size, height: size } });
    await q.setContent(`<html><body style="margin:0"><img src="${fav}" style="width:${size}px;height:${size}px;display:block"></body></html>`);
    await q.goto('file:///' + tmp.replace(/\\/g, '/')); // garante origem file:// para carregar o SVG
    fs.writeFileSync(tmp, `<html><body style="margin:0"><img src="${fav}" style="width:${size}px;height:${size}px;display:block"></body></html>`);
    await q.goto('file:///' + tmp.replace(/\\/g, '/')); await q.waitForTimeout(200);
    await q.screenshot({ path: path.join(size === 48 ? __dirname : PUB, name) }); await q.close();
    console.log('ícone', name);
  }
  fs.unlinkSync(tmp);
  await b.close();
})();
