/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosError } from 'axios';
import { endpoint } from 'common/helpers';
import { defaultHeaders } from 'common/queries/common/headers';

interface Options {
  headers?: Record<string, unknown>;
}

const client = axios.create();

client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 403) {
      window.location.reload();
    }

    return Promise.reject(error);
  }
);

export function request(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  url: string,
  data?: any,
  config?: Options
) {
  return client({
    method,
    url: endpoint(url),
    data,
    headers: { ...defaultHeaders(), ...config?.headers },
  });
}
