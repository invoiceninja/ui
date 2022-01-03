/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosResponse, Method } from 'axios';
import dayjs from 'dayjs';
import { generatePath } from 'react-router';

export function endpoint(endpoint: string, params = {}): string {
  return import.meta.env.VITE_API_URL + generatePath(endpoint, params);
}

export function request(
  method: Method = 'GET',
  route: string,
  data?: object,
  headers?: object
) {
  return axios.request({
    url: route,
    method,
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      ...headers,
    },
    data,
  });
}

export function isHosted(): boolean {
  return import.meta.env.VITE_IS_HOSTED === 'true';
}

export function isSelfHosted(): boolean {
  return !isHosted();
}

export function handleCheckboxChange(id: string, set: any) {
  set.has(id) ? set.delete(id) : set.add(id);

  return set;
}

export function fetcher(
  url: string,
  headers?: object,
  method: Method = 'GET'
): Promise<AxiosResponse> {
  return axios
    .request({
      method,
      url,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        'X-Api-Token': localStorage.getItem(
          'X-NINJA-TOKEN'
        ) as unknown as string,
        ...headers,
      },
    })
    .then((response) => response);
}

export function classNames(...classes: any) {
  return classes.filter(Boolean).join(' ');
}

export function date(date: number | string, format: string) {
  if (typeof date === 'number') {
    return dayjs.unix(date).format(format);
  }

  return dayjs(date).format(format);
}
