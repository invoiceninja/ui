import { ChangeEvent } from 'react';

export function isNonNumericValue(event: ChangeEvent<HTMLInputElement>) {
  if (isNaN(Number(event.target.value)) || event.target.value == '') {
    event.target.value = '0';
    return true;
  }
  return false;
}
