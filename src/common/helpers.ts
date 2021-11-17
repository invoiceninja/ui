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
  return process.env.REACT_APP_API_URL + generatePath(endpoint, params);
}

export function request(
  method: Method = "GET",
  route: string,
  data?: {},
  headers?: {},
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
  return process.env.REACT_APP_IS_HOSTED === "true";
}

export function isSelfHosted(): boolean {
  return !isHosted();
}
