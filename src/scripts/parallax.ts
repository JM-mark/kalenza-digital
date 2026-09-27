import { reduced } from './motion';

// Parallax leve na captura principal da capa do projeto (limitado a 40px).
export function initParallax() {
  const els = [...document.querySelectorAll<HTMLElement>('[data-parallax]')];
  if (!els.length || reduced()) return;
  let ticking = false;
  const paint = () => {
    ticking = false;
    for (const el of els) {
      const r = el.getBoundingClientRect();
      const y = Math.max(-40, Math.min(40, (r.top + r.height / 2 - innerHeight / 2) * -0.06));
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }, { passive: true });
  paint();
}
