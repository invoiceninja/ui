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
import { $refetch } from '../hooks/useRefetch';
import { checkJsonObject, trans } from '../helpers';
import { clearLocalStorage } from './local-storage';
import { toast as $toast } from 'react-hot-toast';

const client = axios.create();

client.interceptors.response.use(
  (response) => {
    const payload = checkJsonObject(response.config.data);
    const requestMethod = response.config.method;

    if (response.config?.headers?.['X-Api-Password'] !== undefined) {
      window.dispatchEvent(new CustomEvent('reset.password.required'));
    }

    if (
      requestMethod === 'put' ||
      (requestMethod === 'post' && payload?.action === 'delete') ||
      requestMethod === 'delete'
    ) {
      $refetch(['activities']);
    }

    return response;
  },
  (error: AxiosError<ValidationBag>) => {
    if (
      (error.response?.config.url?.includes('einvoice') &&
        error.response?.status === 401) ||
      error.response?.status === 403
    ) {
      console.error(error);

      $toast.error(trans('einvoice_something_went_wrong', {}), {
        duration: 10_000,
      });

      return Promise.reject(error);
    }

    if (error.response?.status === 429 || error.response?.status === 403) {
      window.location.reload();
      clearLocalStorage();
    }

    if (error.response?.status === 404) {
      window.dispatchEvent(new CustomEvent('navigate.invalid.page'));
    }

    if (
      error.response?.status &&
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

    if (error.response?.status === 409) {
      toast.processing();
    }

    if (error.response?.status === 422) {
      window.dispatchEvent(
        new CustomEvent('display.error.toaster', {
          detail: {
            error,
          },
        })
      );
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
