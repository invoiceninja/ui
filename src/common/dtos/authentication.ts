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
  emailAddress: string;
  password: string;
  oneTimePassword: string | null;
  secret: string | null;
}

export enum AuthenticationTypes {
  TOKEN = "invoiceninja_token",
  GOOGLE_SSO = "google_sso",
}

export interface Authenticated {
  type: AuthenticationTypes;
}
