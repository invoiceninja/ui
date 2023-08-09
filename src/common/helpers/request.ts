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
import { defaultHeaders } from '$app/common/queries/common/headers';
import { ValidationBag } from '../interfaces/validation-bag';
import { toast } from './toast/toast';

const client = axios.create();

client.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ValidationBag>) => {
    if (error.response?.status === 403) {
      window.location.reload();
      localStorage.clear();
    }

    if (error.response?.status === 404) {
      window.dispatchEvent(new CustomEvent('navigate.invalid.page'));
    }

    if (
      error.response?.status &&
      error.response.status !== 401 &&
      error.response.status !== 412 &&
      error.response.status !== 422 &&
      error.response.status > 399 &&
      error.response.status < 500
    ) {
      toast.error(error.response?.data.message || 'error_title');
    }

    if (error.response?.status && error.response.status === 500) {
      toast.error('error_title');
    }

    console.error(error);

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
