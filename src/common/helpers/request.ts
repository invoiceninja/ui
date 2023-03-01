/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { AxiosError, AxiosRequestConfig, Method } from 'axios';
import { defaultHeaders } from 'common/queries/common/headers';

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
  method: Method,
  url: string,
  data?: any,
  config?: AxiosRequestConfig
) {
  return client({
    method,
    url,
    data,
    ...config,
    headers: { ...defaultHeaders(), ...config?.headers },
    signal: config?.signal,
  });
}
