import { reduced } from './motion';

// Parallax da peça do hero pelo mouse: cada anel se desloca numa profundidade (só mouse, só desktop).
export function initHeroArt() {
  const art = document.querySelector<HTMLElement>('[data-hero-art]');
  if (!art || reduced()) return;
  const hero = art.closest('section')!;
  const layers = [...art.querySelectorAll<SVGGElement>('.ha__layer')];
  if (!matchMedia('(pointer: fine) and (min-width: 1100px)').matches) {
    // ?motion=on sem mouse (celular/tablet): as camadas flutuam sozinhas nas mesmas profundidades, só com o hero na tela
    if (document.documentElement.classList.contains('motion-on')) drift(hero, layers);
    return;
  }
  let x = 0, y = 0, ticking = false;
  const paint = () => {
    ticking = false;
    layers.forEach((l) => {
      const d = Number(l.dataset.depth) * 7;
      l.style.transform = `translate(${(x * d).toFixed(1)}px, ${(y * d).toFixed(1)}px)`;
    });
  };
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    x = (e.clientX - r.left) / r.width - 0.5; y = (e.clientY - r.top) / r.height - 0.5;
    if (!ticking) { ticking = true; requestAnimationFrame(paint); }
  });
  hero.addEventListener('pointerleave', () => { x = y = 0; requestAnimationFrame(paint); });
}

function drift(hero: HTMLElement, layers: SVGGElement[]) {
  let raf = 0, on = false;
  layers.forEach((l) => { l.style.transition = 'none'; });
  const tick = (t: number) => {
    const x = Math.sin(t / 2600) * 0.5, y = Math.cos(t / 3400) * 0.5; // mesmo alcance do mouse (-0,5 a 0,5)
    layers.forEach((l) => {
      const d = Number(l.dataset.depth) * 7;
      l.style.transform = `translate(${(x * d).toFixed(1)}px, ${(y * d).toFixed(1)}px)`;
    });
    if (on) raf = requestAnimationFrame(tick);
  };
  new IntersectionObserver(([e]) => {
    on = e.isIntersecting;
    if (on && !raf) raf = requestAnimationFrame(tick);
    if (!on) { cancelAnimationFrame(raf); raf = 0; }
  }).observe(hero);
}
