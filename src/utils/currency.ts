export function formatCurrency(cents: number): string {
  if (!Number.isInteger(cents)) {
    throw new Error('El importe debe expresarse en centavos enteros');
  }
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const major = Math.floor(abs / 100);
  const minor = abs % 100;
  return `${sign}${major}.${minor.toString().padStart(2, '0')}`;
}

export function parseCurrency(value: string): number {
  const match = value.match(/^(\d+)(?:[.,](\d{1,2}))?$/);
  if (!match) {
    throw new Error('Formato de moneda inválido');
  }
  const major = parseInt(match[1], 10);
  const minor = match[2] ? parseInt(match[2].padEnd(2, '0'), 10) : 0;
  return major * 100 + minor;
}
