export type ApiError = { error: { code: string; message: string }};

const isApiError = (p: any): p is ApiError => !!(p as ApiError)?.error?.code;

export const getApiError = (payload: ApiError|Error|any) => {
  if (isApiError(payload)) return payload.error.message;
  else if (payload instanceof Error) return payload.message;
  return 'unknown_error';
};
