/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { CompanyUser } from './company-user';
import { Timestamps } from './timestamps';

export type CalendarProvider = 'google' | 'microsoft';

export interface CalendarSummary {
  calendar_id: string;
  name: string;
  primary: boolean;
  writable: boolean;
}

export interface CalendarConnection {
  provider: CalendarProvider;
  provider_user_id: string;
  email: string;
  expires_at: number;
  calendars: CalendarSummary[];
}

interface ReferralMeta {
  pro: number;
  free: number;
  enterprise: number;
  calendar_connection?: CalendarConnection;
}

export interface User extends Timestamps {
  id: string;
  custom_value1: string;
  custom_value2: string;
  custom_value3: string;
  custom_value4: string;
  email: string;
  email_verified_at: number;
  first_name: string;
  last_name: string;
  google_2fa_secret: boolean;
  has_password: boolean;
  is_deleted: boolean;
  last_confirmed_email_address: string;
  last_login: number;
  oauth_provider_id: string;
  oauth_user_token: string;
  phone: string;
  signature: string;
  verified_phone_number: boolean;
  company_user?: CompanyUser;
  language_id: string;
  user_logged_in_notification: boolean;
  referral_code?: string;
  referral_meta?: ReferralMeta;
}
