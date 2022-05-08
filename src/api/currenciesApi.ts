import * as E from 'fp-ts/Either';
import { apiRequest } from './apiRequest';
import { ApiDate } from '../utils/date';
import type { CurrencyCode, CurrencyRatesResponse } from '../store/currencyRatesSlice';
import { ApiError } from '../utils/apiError';

export const mapResponse = (r: CurrencyRatesResponse) => ({
  ...r,
  rates: (Object.entries(r.rates) as [CurrencyCode, number][]).map(
    ([currency, rate]) => ({
      currency,
      rate: 1 / rate,
    }),
  ),
});

export const fetchCurrencies = () => apiRequest<{ symbols: Record<CurrencyCode, string> }>({
  url: '/exchangerates_data/symbols',
  method: 'GET',
}).then(E.map((r) => r.symbols));

export const fetchLatestCurrencyRates = (
  base: CurrencyCode,
) => apiRequest<CurrencyRatesResponse>({
  url: '/exchangerates_data/latest',
  method: 'GET',
  queryParams: { base },
}).then(E.map(mapResponse));

export const fetchCurrencyRatesAtDate = (
  base: CurrencyCode,
  date: ApiDate,
) => apiRequest<CurrencyRatesResponse, ApiError>({
  url: '/exchangerates_data/{date}',
  method: 'GET',
  queryParams: { base },
  urlParams: { date },
}).then(E.map(mapResponse));
