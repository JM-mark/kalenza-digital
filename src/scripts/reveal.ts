import { reduced } from './motion';

// Entradas: títulos palavra por palavra, blocos que sobem, abertura octogonal das imagens e
// octógonos que se desenham. Cada elemento anima uma vez só.
const SEL = '[data-split], [data-reveal], .aperture, [data-in]';

export function initReveal() {
  const els = [...document.querySelectorAll<HTMLElement>(SEL)];
  if (reduced() || !('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('is-in')); return; }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -2% 0px', threshold: 0 });
  els.forEach((el) => io.observe(el));
}
