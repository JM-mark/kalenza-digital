import { reduced } from './motion';

// Botões magnéticos: seguem levemente o mouse (até ~10px) e voltam ao lugar ao sair.
export function initMagnetic() {
  if (reduced() || !matchMedia('(pointer: fine)').matches) return;
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${Math.max(-10, Math.min(10, dx * 0.22)).toFixed(1)}px, ${Math.max(-8, Math.min(8, dy * 0.3)).toFixed(1)}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}
