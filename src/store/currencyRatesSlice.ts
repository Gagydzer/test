import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as E from 'fp-ts/Either';
import type { RootState } from './index';
import * as API from '../api/currenciesApi';
import { ApiDate } from '../utils/date';
import { getApiError } from '../utils/apiError';

export enum CurrencyCodeBrand { _ = '' }

export type CurrencyCode = CurrencyCodeBrand & string;
export type CurrencyRate = { currency: CurrencyCode; rate: number }
export type CurrencyRatesResponse = {
    base: CurrencyCode;
    date: ApiDate;
    rates: Record<CurrencyCode, number>
}
type CurrencyRatesInitState = {
    base: CurrencyCode,
    state: 'loading'
    date: null,
    rates: null,
    error: null,
}

type CurrencyRatesLoadingState = {
    base: CurrencyCode,
    state: 'loading',
    date: ApiDate,
    rates: CurrencyRate[],
    error: null,
}

type CurrencyRatesSucceededState = {
    base: CurrencyCode,
    state: 'succeeded',
    date: ApiDate,
    rates: CurrencyRate[],
    error: null,
}

type CurrencyRatesFailedState = {
    base: CurrencyCode,
    state: 'failed',
    date: ApiDate,
    rates: null,
    error: string,
}

type CurrencyRatesState = CurrencyRatesInitState|
    CurrencyRatesLoadingState|
    CurrencyRatesSucceededState|
    CurrencyRatesFailedState;

const initialState = {
  base: 'RUB' as CurrencyCode,
  state: 'loading',
  date: null,
  rates: null,
} as CurrencyRatesState;

export const currencyRatesSlice = createSlice({
  name: 'currencyRates',
  initialState,
  reducers: {
    startLoadingByDate: (state, action: PayloadAction<ApiDate>) => {
      state.state = 'loading';
      state.date = action.payload;
      state.error = null;
    },
    succeeded: (state, action: PayloadAction<ReturnType<typeof API.mapResponse>>) => {
      state.state = 'succeeded';
      state.date = action.payload.date;
      state.base = action.payload.base;
      state.rates = action.payload.rates;
      state.error = null;
    },
    failed: (state, action: PayloadAction<string>) => {
      state.state = 'failed';
      state.date = null;
      state.rates = [];
      state.error = action.payload;
    },
  },
});

export const { startLoadingByDate, succeeded, failed } = currencyRatesSlice.actions;

export const selectorCurrencyRates = (state: RootState) => state.currencyRates.rates || [];
export const selectorCurrencyRatesDate = (state: RootState) => state.currencyRates.date;
export const selectorCurrencyRatesState = (state: RootState) => state.currencyRates.state || [];
export const selectorCurrencyRatesBase = (state: RootState) => state.currencyRates.base;
export const selectorCurrencyRatesErrorMessage = (state: RootState) => state.currencyRates.error;

export const fetchCurrencyRates = createAsyncThunk(
  'currencyRates/fetchCurrencyRates',
  async ({ date }: { date?: ApiDate } = {}, thunkAPI) => {
    const oldState = thunkAPI.getState() as RootState;
    if (date) {
      thunkAPI.dispatch(startLoadingByDate(date));
    }
    const response = await (date
      ? API.fetchCurrencyRatesAtDate(oldState.currencyRates.base, date)
      : API.fetchLatestCurrencyRates(oldState.currencyRates.base)
    );
    thunkAPI.dispatch(
      E.isRight(response)
        ? succeeded(response.right)
        : failed(getApiError(response.left) ?? 'unknown_error'),
    );
  },
);

export default currencyRatesSlice.reducer;
