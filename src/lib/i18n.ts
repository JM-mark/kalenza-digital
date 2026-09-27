import type { Lang } from './config';
import pfPt from '../i18n/portfolio-pt.json';
import pfEn from '../i18n/portfolio-en.json';
import pfAr from '../i18n/portfolio-ar.json';
import sitePt from '../i18n/site-pt.json';

// Textos nativos do portfólio + textos próprios do site. EN e AR ganham o site-*.json na etapa 4.
const PORTFOLIO = { pt: pfPt, en: pfEn, ar: pfAr };
const SITE_COPY: Partial<Record<Lang, typeof sitePt>> = { pt: sitePt };

export function t(lang: Lang) {
  const site = SITE_COPY[lang] ?? sitePt;
  // a mensagem pronta do WhatsApp do site é diferente da do PDF
  return { ...PORTFOLIO[lang], wa_text: site.wa_text, site };
}

export const dir = (lang: Lang) => (lang === 'ar' ? 'rtl' : 'ltr');

/**
 * Quebra um título em palavras para a entrada palavra por palavra.
 * Aceita <i>…</i> (destaque champanhe) e <br>. No árabe, a divisão é por palavra,
 * então as letras continuam ligadas dentro de cada palavra.
 */
export function split(html: string): string {
  let i = 0;
  const words = (s: string) =>
    s.split(/(\s+)/).map((w) => (w.trim() ? `<span class="w" style="--i:${i++}">${w}</span>` : w)).join('');
  return html
    .split(/(<i>[\s\S]*?<\/i>|<br\s*\/?>)/)
    .map((part) => {
      if (part.startsWith('<i>')) return `<i>${words(part.slice(3, -4))}</i>`;
      if (/^<br/.test(part)) return '<br>';
      return words(part);
    })
    .join('');
}

export const pad = (n: number) => String(n).padStart(2, '0');
