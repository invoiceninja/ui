/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios, { Method } from "axios";
import { generatePath } from "react-router";

export function endpoint(endpoint: string, params = {}): string {
  return import.meta.env.VITE_API_URL + generatePath(endpoint, params);
}

export function request(
  method: Method = "GET",
  route: string,
  data?: {},
  headers?: {}
) {
  return axios.request({
    url: route,
    method,
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/json",
      ...headers,
    },
    data,
  });
}

export function isHosted(): boolean {
  return import.meta.env.VITE_IS_HOSTED === "true";
}

export function isSelfHosted(): boolean {
  return !isHosted();
}

export function handleCheckboxChange(id: string, set: any) {
  set.has(id) ? set.delete(id) : set.add(id);

  return set;
}
