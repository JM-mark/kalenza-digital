import { lite } from './motion';

// Vídeos das faixas: só entram perto da tela (300px), pausam fora dela, usam o corte 9:16 no
// celular e aparecem com fade quando começam a tocar. Com movimento reduzido, economia de dados
// ou 2G/3G nada é baixado: fica o pôster (ou o placeholder).
export function initVideos() {
  // o padrão animado do placeholder só se move enquanto a faixa está na tela
  if ('IntersectionObserver' in window) {
    const live = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle('is-live', e.isIntersecting)));
    document.querySelectorAll('.vband').forEach((b) => live.observe(b));
  }

  const videos = [...document.querySelectorAll<HTMLVideoElement>('video.vband__video')];
  if (!videos.length || lite() || !('IntersectionObserver' in window)) return;
  const phone = matchMedia('(max-width: 767px)').matches;
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const v = e.target as HTMLVideoElement;
      if (e.isIntersecting) {
        if (!v.src) {
          v.src = (phone ? v.dataset.mobile : v.dataset.desktop)!;
          v.muted = true;
          v.addEventListener('playing', () => v.classList.add('is-playing'), { once: true });
        }
        v.play().catch(() => {});
      } else if (v.src) v.pause();
    }
  }, { rootMargin: '300px 0px' });
  videos.forEach((v) => io.observe(v));
  // iOS em modo de pouca energia recusa o autoplay: o primeiro toque na página conta como gesto
  const retry = () => videos.forEach((v) => { if (v.src && v.paused && v.getBoundingClientRect().bottom > 0 && v.getBoundingClientRect().top < innerHeight) v.play().catch(() => {}); });
  addEventListener('touchend', retry, { once: true, passive: true });
}
