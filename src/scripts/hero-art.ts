import { reduced } from './motion';

// Parallax da peça do hero pelo mouse: cada anel se desloca numa profundidade (só mouse, só desktop).
export function initHeroArt() {
  const art = document.querySelector<HTMLElement>('[data-hero-art]');
  if (!art || reduced() || !matchMedia('(pointer: fine) and (min-width: 1100px)').matches) return;
  const hero = art.closest('section')!;
  const layers = [...art.querySelectorAll<SVGGElement>('.ha__layer')];
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
