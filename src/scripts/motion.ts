export const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Economia de dados, 2G/3G ou movimento reduzido: sem vídeo (fica o pôster ou o placeholder). */
export function lite(): boolean {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return reduced() || window.matchMedia('(prefers-reduced-data: reduce)').matches || !!conn?.saveData || /(^|-)[23]g$/.test(conn?.effectiveType ?? '');
}
