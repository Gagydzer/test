import React, {
  ChangeEvent, useCallback, useEffect, useMemo, useRef, useState,
} from 'react';
import { useQueryParam } from '../../hooks/useQueryParams';
import { useAppDispatch, useAppSelector } from '../../hooks/store';
import {
  CurrencyCode,
  CurrencyRate,
  fetchCurrencyRates,
  selectorCurrencyRates,
  selectorCurrencyRatesBase,
  selectorCurrencyRatesDate, selectorCurrencyRatesErrorMessage, selectorCurrencyRatesState,
} from '../../store/currencyRatesSlice';
import {
  fetchCurrencies, selectorCurrencies, selectorCurrenciesList,
} from '../../store/currenciesSlice';
import DataTable, { SortData, TableColumns } from '../../components/DataTable/DataTable';
import { formatCurrency } from '../../utils/currency';
import './Main.css';
import { ApiDate } from '../../utils/date';

const validateNumberString = (value: string) => /^\d+(\.\d+)?$/.test(value);

const parseNumberString = (value: string) => {
  if (!validateNumberString(value)) return Number.NaN;
  return Number.parseFloat(value);
};

export default function Main() {
  const [sort, setSort] = useQueryParam<SortData<CurrencyRate>|undefined>('sort');
  const updateSort = useCallback((payload: SortData<CurrencyRate>|undefined) => {
    setSort(payload);
  }, []);
  const dispatch = useAppDispatch();

  const currenciesMap = useAppSelector(selectorCurrencies);
  const currenciesList = useAppSelector(selectorCurrenciesList);
  const currencyRates = useAppSelector(selectorCurrencyRates);
  const currencyRatesState = useAppSelector(selectorCurrencyRatesState);
  const currencyRatesDate = useAppSelector(selectorCurrencyRatesDate);
  const currencyRatesBase = useAppSelector(selectorCurrencyRatesBase);
  const errorMessage = useAppSelector(selectorCurrencyRatesErrorMessage);

  const [date, setDate] = useQueryParam<ApiDate|undefined>('date');
  const [dateInputValue, setDateInputValue] = useState('');
  const dateInputValueRef = useRef('');
  useEffect(() => {
    dateInputValueRef.current = date ?? '';
    setDateInputValue(date ?? '');
  }, [date]);
  const onChangeDate = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    dateInputValueRef.current = e.target.value;
    setDateInputValue(e.target.value);
  }, []);
  const onBlurDate = useCallback(() => {
    setDate(dateInputValueRef.current as ApiDate);
  }, []);

  useEffect(() => {
    if (currencyRatesDate !== dateInputValueRef.current) {
      setDateInputValue(currencyRatesDate ?? '');
      dateInputValueRef.current = currencyRatesDate ?? '';
    }
  }, [currencyRatesDate]);

  useEffect(() => {
    dispatch(fetchCurrencyRates({ date }));
  }, [date]);

  useEffect(() => {
    dispatch(fetchCurrencies());
  }, []);

  const [currencyCompareWith, setCurrencyCompareWith] = useQueryParam<CurrencyCode>('compare_with');
  const onSelectCurrencyCompareWith = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setCurrencyCompareWith(e.target.value as CurrencyCode);
    },
    [],
  );
  const comparingCurrencyExchangeRate = useMemo(
    () => {
      if (!currencyCompareWith) return null;
      return currencyRates.find(({ currency }) => currency === currencyCompareWith)?.rate ?? null;
    },
    [currencyRates, currencyCompareWith],
  );

  const [amountRaw, setAmountRaw] = useState('');
  const amount = useMemo(() => {
    const parsed = parseNumberString(amountRaw);
    if (Number.isNaN(parsed)) return 0;
    return parsed;
  }, [amountRaw]);
  const onChangeAmountRaw = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setAmountRaw(e.target.value);
  }, []);
  const onBlurAmountRaw = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (Number.isNaN(parseNumberString(e.target.value))) {
      setAmountRaw('');
    }
  }, []);
  const amountInBaseCurrency = useMemo(() => {
    if (!comparingCurrencyExchangeRate || !amount) return null;
    return amount * comparingCurrencyExchangeRate;
  }, [amount, comparingCurrencyExchangeRate]);

  const tableStatusText = useMemo(() => {
    if (currencyRatesState === 'loading') return 'Loading...';
    else if (currencyRatesState === 'failed') return errorMessage as string;
    return undefined;
  }, [currencyRatesState, errorMessage]);
  const columns = useMemo(() => ([
    {
      key: 'currency',
      label: 'CURRENCY',
      renderCell: (record) => `${currenciesMap[record.currency]} (${record.currency})`,
    },
    {
      key: 'rate',
      label: 'RATE',
      renderCell: (record) => formatCurrency(record.rate, currencyRatesBase),
    },
  ] as TableColumns<CurrencyRate>), [currenciesMap, currencyRatesBase]);
  const currencyRatesTableMemoized = useMemo(() => (
    <DataTable
      records={currencyRates}
      columns={columns}
      recordKey="currency"
      sort={sort}
      onSortChange={updateSort}
      statusText={tableStatusText}
    />
  ), [currencyRates, columns, sort, updateSort, tableStatusText]);

  return (
    <section className="Main">
      <div className="Main-controls">
        <div>
          <select
            defaultValue="default"
            className="Main-currencySelector"
            value={currencyCompareWith}
            onChange={onSelectCurrencyCompareWith}
          >
            <option value="default" disabled>
              Choose an currency
            </option>
            {
                currenciesList.map((c) => (
                  <option
                    value={c.code}
                    key={c.code}
                  >
                    { c.name }
                    &nbsp;(
                    { c.code}
                    )
                  </option>
                ))
            }
          </select>
          <input
            className="Main-currencyInput"
            placeholder="Type amount"
            value={amountRaw}
            onChange={onChangeAmountRaw}
            onBlur={onBlurAmountRaw}
          />
          <span className="Main-displayValue">
            { amountInBaseCurrency !== null
            && formatCurrency(amountInBaseCurrency, currencyRatesBase) }
          </span>
        </div>
        <div>
          <span>
            {currenciesMap[currencyRatesBase] || currencyRatesBase}
            &nbsp;
            Exchange rate at
            &nbsp;
          </span>
          <input type="date" value={dateInputValue} onChange={onChangeDate} onBlur={onBlurDate} />
        </div>
      </div>
      <div className="Main-tableWrapper">
        { currencyRatesTableMemoized }
      </div>
    </section>

  );
}
