/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export interface SearchResponse {
  client_contacts: SearchRecord[];
  clients: SearchRecord[];
  invoices: SearchRecord[];
  projects: SearchRecord[];
  settings: SearchRecord[];
  tasks: SearchRecord[];
  products: SearchRecord[];
  expenses: SearchRecord[];
  payments: SearchRecord[];
  quotes: SearchRecord[];
  credits: SearchRecord[];
  recurrings: SearchRecord[];
  vendors: SearchRecord[];
  vendor_contacts: SearchRecord[];
}

export interface SearchRecord {
  name: string;
  type: string;
  id: string;
  path: string;
  heading: string;
}
