// @ts-ignore
import * as JSURL from 'jsurl';
import * as React from 'react';
import type { NavigateOptions } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';

export const useQueryParam = <T>(
  key: string,
): [T | undefined, (newQuery: T, options?: NavigateOptions) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramValue = searchParams.get(key);

  const value = React.useMemo(() => JSURL.parse(paramValue), [paramValue]);

  const setValue = React.useCallback(
    (newValue: T, options?: NavigateOptions) => {
      const newSearchParams = new URLSearchParams(searchParams);
      if (newValue === undefined) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, JSURL.stringify(newValue));
      }
      setSearchParams(newSearchParams, options);
    },
    [key, searchParams, setSearchParams],
  );

  return [value, setValue];
};
