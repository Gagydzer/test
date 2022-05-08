import * as E from 'fp-ts/Either';

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type ApiRequestConfig = {
    method: ApiMethod;
    url: string;
    queryParams?: Record<string, string|string[]>;
    urlParams?: Record<string, string>;
}

const BASE_URL = `${process.env.REACT_APP_API_SCHEME}://${process.env.REACT_APP_API_HOST}`;

const getErrorMessage = (e: unknown) => {
  if (e instanceof Error) {
    return e.message;
  }
  return e;
};

export const apiRequest = async <SuccessResponse, FailedResponse = any>(
  request: ApiRequestConfig,
): Promise<E.Either<FailedResponse|Error, SuccessResponse>> => {
  try {
    const urlPrepared = request.urlParams
      ? Object.entries(request.urlParams).reduce((acc, [key, value]) => acc.replace(
        new RegExp(`{${key}}`, 'g'),
        encodeURIComponent(value),
      ), request.url)
      : request.url;

    const url = new URL(urlPrepared, BASE_URL);

    if (request.queryParams) {
      url.search = Object.entries(request.queryParams).reduce((acc, [key, value]) => {
        if (Array.isArray(value)) {
          value.forEach((val) => {
            acc.append(key, val);
          });
        } else {
          acc.append(key, value);
        }
        return acc;
      }, new URLSearchParams()).toString();
    }

    const headers = new Headers();
    headers.append('apiKey', process.env.REACT_APP_API_KEY as string);

    const response = await fetch(url.toString(), {
      method: request.method,
      headers,
    });

    const status = ({
      GET: [200],
      POST: [200, 201],
      PATCH: [200],
      PUT: [200],
      DELETE: [204, 202, 200],
    } as Record<ApiMethod, number[]>)[request.method].includes(response.status);

    try {
      const json = await response.json();
      return status ? E.right(json as SuccessResponse) : E.left(json as FailedResponse);
    } catch (e) {
      return E.left(new Error(`Parsing error: ${getErrorMessage(e)}`));
    }
  } catch (e) {
    return E.left(new Error(`ApiRequest error: ${getErrorMessage(e)}`));
  }
};
