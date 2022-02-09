/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */
export interface TotalDataDTO {
  revenue: { paid_to_date: string; code: string };
  expenses: { amount: string; code: string };
  outstanding: Record<string, unknown>;
}
export interface ChartDataDTO {
  invoices: { total: string; date: string; currency: string }[];
  payments: { total: string; date: string; currency: string }[];
  expenses: {
    total: string;
    date: string;
    currency: string;
  }[];
}
export interface ChartMapDTO {
  name: string;
  invoices: string;
  expenses: string;
  payments: string;
}
export interface RequestBodyDTO {
  start_date: string;
  end_date: string;
}
