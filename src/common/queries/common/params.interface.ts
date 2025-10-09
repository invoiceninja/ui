/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface Params {
  perPage?: number | string;
  currentPage?: number | string;
  filter?: string;
  status?: string[];
  sort?: string;
  companyDocuments?: 'true' | 'false';
  ninjaCompanyKey?: string;
  ninjaAccountKey?: string;
  search?: string;
}
