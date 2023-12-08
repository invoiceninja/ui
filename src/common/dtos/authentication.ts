/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface LoginForm {
  email: string;
  password: string;
  one_time_password?: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  password_confirmation: string;
  terms_of_service: boolean;
  privacy_policy: boolean;
}

export interface ForgotPasswordForm {
  email: string;
}

export enum AuthenticationTypes {
  TOKEN = 'invoiceninja_token',
  GOOGLE_SSO = 'google_sso',
}

export interface Authenticated {
  type: AuthenticationTypes;
  user: Record<string, unknown>;
  token: string;
}
export interface Registered {
  user: any;
  token: string;
}
