/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface LoginValidation {
  email?: string[];
  password?: string[];
  one_time_password?: string[];
}

export interface RegisterValidation {
  email?: string[];
  password?: string[];
  password_confirmation?: string[];
}

export interface ForgotPasswordValidation {
  email?: string[];
}
