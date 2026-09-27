import { reduced } from './motion';

// Processo: no desktop, as 5 etapas viram capítulos fixados (técnica GSAP + ScrollTrigger dos
// capítulos das clínicas): a etapa que sai sobe e some, a que entra desliza de baixo, e o trilho
// de octógonos acompanha. O GSAP só é baixado no desktop, quando a seção se aproxima.
// No celular e com movimento reduzido fica a lista vertical (só CSS).
export function initProcess() {
  const sec = document.querySelector<HTMLElement>('.proc');
  if (!sec || reduced() || !('IntersectionObserver' in window)) return;
  const desk = matchMedia('(min-width: 1100px) and (min-height: 640px)');
  let started = false;
  const start = () => {
    if (started || !desk.matches) return;
    started = true;
    const io = new IntersectionObserver(async ([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
      gsap.registerPlugin(ScrollTrigger);
      pin(sec, gsap, ScrollTrigger);
    }, { rootMargin: '900px 0px' });
    io.observe(sec);
  };
  start();
  desk.addEventListener('change', start);
}

function pin(sec: HTMLElement, gsap: typeof import('gsap').gsap, ST: typeof import('gsap/ScrollTrigger').ScrollTrigger) {
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1100px) and (min-height: 640px)', () => {
    const steps = gsap.utils.toArray<HTMLElement>('.step', sec);
    const nums = steps.map((s) => s.querySelector('.step__num'));
    const txts = steps.map((s) => s.querySelector('.step__text'));
    const nodes = gsap.utils.toArray<HTMLElement>('.rail__node', sec);
    const fill = sec.querySelector('.rail__fill');
    const n = steps.length;
    sec.classList.add('is-pinned');
    // os textos entram pelo GSAP, não pelo reveal: se a seção foi aberta pelo menu antes da entrada,
    // o valor inicial registrado seria opacidade 0 e a 1ª etapa ficaria em branco
    txts.forEach((t) => t?.classList.add('is-in'));
    gsap.set([...txts, ...nums], { autoAlpha: 1, y: 0 });
    gsap.set(steps, { autoAlpha: 0 });
    gsap.set(steps[0], { autoAlpha: 1 });
    const mark = (k: number) => nodes.forEach((el, i) => { el.classList.toggle('is-on', i <= k); el.toggleAttribute('aria-current', i === k); });
    mark(0);
    const tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: {
        trigger: sec.querySelector('.proc__stage'), start: 'top top', end: () => '+=' + innerHeight * (n - 1) * 0.26,
        pin: true, scrub: 0.8, anticipatePin: 1,
        snap: { snapTo: 'labelsDirectional', duration: { min: 0.25, max: 0.7 }, delay: 0.08, ease: 'power1.inOut' },
        onUpdate: (self) => {
          mark(Math.min(n - 1, Math.round(self.progress * (n - 1))));
          if (fill) (fill as HTMLElement).style.transform = `scaleX(${self.progress})`;
        },
      },
    });
    tl.addLabel('s0', 0);
    for (let i = 1; i < n; i++) {
      const at = i - 1 + 0.3;
      tl.to(txts[i - 1], { autoAlpha: 0, y: -34, duration: 0.3 }, at)
        .to(nums[i - 1], { autoAlpha: 0, y: -48, duration: 0.35 }, at)
        .set(steps[i], { autoAlpha: 1 }, at + 0.2)
        .fromTo(nums[i], { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.45 }, at + 0.2)
        .fromTo(txts[i], { autoAlpha: 0, y: 44 }, { autoAlpha: 1, y: 0, duration: 0.4 }, at + 0.3)
        .set(steps[i - 1], { autoAlpha: 0 }, at + 0.7)
        .addLabel('s' + i, i);
    }
    addEventListener('load', () => ST.refresh(), { once: true });
    return () => { sec.classList.remove('is-pinned'); gsap.set([...steps, ...nums, ...txts], { clearProps: 'all' }); };
  });
}
