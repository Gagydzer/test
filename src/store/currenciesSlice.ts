import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as E from 'fp-ts/Either';
import type { RootState } from './index';
import * as API from '../api/currenciesApi';
import { CurrencyCode } from './currencyRatesSlice';

type CurrenciesLoadingState = {
    state: 'loading',
    currencies: null,
}

type CurrenciesSucceededState = {
    state: 'succeeded',
    currencies: Record<CurrencyCode, string>,
}

type CurrenciesFailedState = {
    state: 'failed',
    currencies: null,
}

export type CurrenciesState = CurrenciesLoadingState|
    CurrenciesSucceededState|
    CurrenciesFailedState

const initialState = {
  state: 'loading',
  currencies: null,
} as CurrenciesState;

const currenciesSlice = createSlice({
  name: 'currencies',
  initialState,
  reducers: {
    succeded: (state, action: PayloadAction<Record<CurrencyCode, string>>) => {
      state.state = 'succeeded';
      state.currencies = action.payload;
    },
    failed: (state) => {
      state.state = 'failed';
      state.currencies = null;
    },
  },
});

const { succeded, failed } = currenciesSlice.actions;

export const selectorCurrencies = (
  state: RootState,
) => (state.currencies.currencies || {}) as Record<CurrencyCode, string>;

export const selectorCurrenciesList = (
  state: RootState,
) => (state.currencies.currencies
  ? (Object.entries(state.currencies.currencies) as [CurrencyCode, string][]).map(
    ([code, name]) => ({
      code, name,
    }),
  ) : []);

export const fetchCurrencies = createAsyncThunk(
  'currencies/fetchCurrencies',
  async (_, thunkApi) => {
    const response = await API.fetchCurrencies();
    thunkApi.dispatch(
      E.isRight(response)
        ? succeded(response.right)
        : failed(),
    );
  },
);

export default currenciesSlice.reducer;
