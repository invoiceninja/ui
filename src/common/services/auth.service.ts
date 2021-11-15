/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import axios from "axios";
import { LoginForm } from "../dtos/authentication";
import { endpoint } from "../helpers";

export class AuthService {
  login(values: LoginForm) {
    return axios.post(
      endpoint("/api/v1/login"),
      {
        email: values.emailAddress,
        password: values.password,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      }
    );
  }
}
