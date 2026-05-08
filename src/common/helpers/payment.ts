import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export function dateUTC(date: number | string, format: string) {
  if (date === 0 || date === '' || date === undefined) {
    return '';
  }

  if (typeof date === 'number') {
    return dayjs.unix(date).utc().format(format);
  }

  return dayjs(date).utc().format(format);
}
