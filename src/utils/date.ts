const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export enum ApiDateBrand { _ = '' }

export type ApiDate = ApiDateBrand & string;

export const formatDate = (date: Date) => dateFormatter.format(date);

export const dateToApiDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return [year, month, day].join('-') as ApiDate;
};
