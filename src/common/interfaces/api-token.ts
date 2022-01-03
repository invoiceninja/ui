/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface ApiToken {
  id: string;
  name: string;
  token: string;
  user_id: string;
  is_system: boolean;
  archived_at: number;
  created_at: number;
  is_deleted: boolean;
  updated_at: number;
}
