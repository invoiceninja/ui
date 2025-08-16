/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface Blueprint {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  archived_at: string;
  is_deleted: boolean;
}
