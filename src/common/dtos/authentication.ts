/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface LoginForm {
  email: string;
  password: string;
}

export enum AuthenticationTypes {
  TOKEN = "invoiceninja_token",
  GOOGLE_SSO = "google_sso",
}

export interface Authenticated {
  type: AuthenticationTypes;
  user: {};
}
