import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import currencyRatesReducer from './currencyRatesSlice';
import currenciesReducer from './currenciesSlice';

const store = configureStore({
  reducer: {
    currencyRates: currencyRatesReducer,
    currencies: currenciesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
    >;

export const selectorIsReady = (state: RootState) => [
  state.currencies.state,
  state.currencyRates.state,
].every((state) => ['succeeded', 'failed'].includes(state));

export default store;
