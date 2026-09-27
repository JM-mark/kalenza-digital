import type { Lang } from './config';
import pfPt from '../i18n/portfolio-pt.json';
import pfEn from '../i18n/portfolio-en.json';
import pfAr from '../i18n/portfolio-ar.json';
import sitePt from '../i18n/site-pt.json';
import siteEn from '../i18n/site-en.json';
import siteAr from '../i18n/site-ar.json';

// Textos nativos do portfólio + textos próprios do site (site-*.json).
const PORTFOLIO = { pt: pfPt, en: pfEn, ar: pfAr };
const SITE_COPY: Record<Lang, typeof sitePt> = { pt: sitePt, en: siteEn, ar: siteAr };

export function t(lang: Lang) {
  const site = SITE_COPY[lang];
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
  // palavras de até 2 letras ("à", "a", "de", "to", "في") ficam presas à seguinte com espaço não separável
  const glue = (list: string[]) => {
    const out: string[] = [];
    for (let k = 0; k < list.length; k++) {
      let w = list[k];
      while (k < list.length - 1 && [...w.split('\u00a0').pop()!].length <= 2) w += '\u00a0' + list[++k];
      out.push(w);
    }
    return out;
  };
  const words = (s: string) => {
    const lead = /^\s/.test(s) ? ' ' : '', tail = /\s$/.test(s) ? ' ' : '';
    const list = glue(s.trim().split(/\s+/).filter(Boolean));
    return lead + list.map((w) => `<span class="w" style="--i:${i++}">${w}</span>`).join(' ') + tail;
  };
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
