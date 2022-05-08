import { CurrencyCode } from '../store/currencyRatesSlice';

const cachedFormatters = new Map<CurrencyCode, Intl.NumberFormat>();

const getCurrencyFormatter = (code: CurrencyCode) => {
  const formatter = cachedFormatters.get(code);
  if (formatter) return formatter;
  else {
    const formatter = new Intl.NumberFormat('ru', {
      currency: code,
      style: 'currency',
      currencyDisplay: 'symbol',
      maximumFractionDigits: 4,
    });
    cachedFormatters.set(code, formatter);
    return formatter;
  }
};

export const formatCurrency = (
  value: number,
  code: CurrencyCode,
) => getCurrencyFormatter(code).format(value);
