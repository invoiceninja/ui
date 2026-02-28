/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  Quickbooks,
  QuickbooksSyncDirection,
} from '$app/common/interfaces/quickbooks';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';

export const mockQuickbooksData: Quickbooks = {
  accessTokenKey:
    'eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4Q0JDLUhTMjU2IiwieC5vcmciOiJIMCJ9..czhSgxJRnDdinB4Y7H6dow.vmIkdN1yNgvkSf1O7__0ojHHNkAq-yH-szAEztn9G0t0FFB9h4JSW1DYFyPRDyctOU9aeoWiQb7aSbILwD65u7KslyFn3DDJwcBi-2UcZ84_x2Xl7T4zYZCazXB8z0B5_Ysy4ukbHtige1GS9mQJxmxZId_xFh0EVX4LP1QqKEzCTjS3P7XG9IF7tmVOvqcjy20ssnJ-2H45W_Dl7SKQvpR7WGLJn8YwHolfsvV2R0Ssen_y8vq-cK497KlcWowdtJSnevOLw2_LRJl62iwH5ZeGigROrbn9dpPehK7ULSX4-7VMkRPLpG3uaFJeHnFJr6QX21m9YD41xWy-UsfmeNb-4te56Y_B25RMTzhDjtuhzrWimExvgyVymizMCFXhwc8FqcW6bHdoKLU8gGomygs5oh6OJryadC_F4qjMYOukxSZzxTT3K77YyXqTKlxXWX5DWeUsccSHRGm4YcNQiKKtmtFnTs-O_umqPFKmNbc.HRJCM_oeSyHI4YBs651XvA',
  refresh_token: 'RT1-28-H0-1779099101r03scwwsztslq0rgwi1j',
  realmID: '9341452606525885',
  accessTokenExpiresAt: 1770376301,
  refreshTokenExpiresAt: 1779099100,
  baseURL: 'https://sandbox-quickbooks.api.intuit.com/',
  companyName: 'Sandbox Company_US_1',
  settings: {
    client: {
      direction: QuickbooksSyncDirection.Push,
    },
    vendor: {
      direction: QuickbooksSyncDirection.None,
    },
    invoice: {
      direction: QuickbooksSyncDirection.Push,
    },
    sales: {
      direction: QuickbooksSyncDirection.None,
    },
    quote: {
      direction: QuickbooksSyncDirection.None,
    },
    purchase_order: {
      direction: QuickbooksSyncDirection.None,
    },
    product: {
      direction: QuickbooksSyncDirection.Push,
    },
    payment: {
      direction: QuickbooksSyncDirection.None,
    },
    expense: {
      direction: QuickbooksSyncDirection.None,
    },
    expense_category: {
      direction: QuickbooksSyncDirection.None,
    },
    income_account_map: [
      {
        id: '85',
        name: 'Billable Expense Income',
        fully_qualified_name: 'Billable Expense Income',
        parent_ref: '',
      },
      {
        id: '47',
        name: 'Decks and Patios',
        fully_qualified_name:
          'Landscaping Services:Job Materials:Decks and Patios',
        parent_ref: '46',
      },
      {
        id: '82',
        name: 'Design income',
        fully_qualified_name: 'Design income',
        parent_ref: '',
      },
      {
        id: '86',
        name: 'Discounts given',
        fully_qualified_name: 'Discounts given',
        parent_ref: '',
      },
      {
        id: '5',
        name: 'Fees Billed',
        fully_qualified_name: 'Fees Billed',
        parent_ref: '',
      },
      {
        id: '48',
        name: 'Fountains and Garden Lighting',
        fully_qualified_name:
          'Landscaping Services:Job Materials:Fountains and Garden Lighting',
        parent_ref: '46',
      },
      {
        id: '52',
        name: 'Installation',
        fully_qualified_name: 'Landscaping Services:Labor:Installation',
        parent_ref: '51',
      },
      {
        id: '46',
        name: 'Job Materials',
        fully_qualified_name: 'Landscaping Services:Job Materials',
        parent_ref: '45',
      },
      {
        id: '51',
        name: 'Labor',
        fully_qualified_name: 'Landscaping Services:Labor',
        parent_ref: '45',
      },
      {
        id: '45',
        name: 'Landscaping Services',
        fully_qualified_name: 'Landscaping Services',
        parent_ref: '',
      },
      {
        id: '53',
        name: 'Maintenance and Repair',
        fully_qualified_name:
          'Landscaping Services:Labor:Maintenance and Repair',
        parent_ref: '51',
      },
      {
        id: '83',
        name: 'Other Income',
        fully_qualified_name: 'Other Income',
        parent_ref: '',
      },
      {
        id: '54',
        name: 'Pest Control Services',
        fully_qualified_name: 'Pest Control Services',
        parent_ref: '',
      },
      {
        id: '49',
        name: 'Plants and Soil',
        fully_qualified_name:
          'Landscaping Services:Job Materials:Plants and Soil',
        parent_ref: '46',
      },
      {
        id: '6',
        name: 'Refunds-Allowances',
        fully_qualified_name: 'Refunds-Allowances',
        parent_ref: '',
      },
      {
        id: '79',
        name: 'Sales of Product Income',
        fully_qualified_name: 'Sales of Product Income',
        parent_ref: '',
      },
      {
        id: '1',
        name: 'Services',
        fully_qualified_name: 'Services',
        parent_ref: '',
      },
      {
        id: '50',
        name: 'Sprinklers and Drip Systems',
        fully_qualified_name:
          'Landscaping Services:Job Materials:Sprinklers and Drip Systems',
        parent_ref: '46',
      },
      {
        id: '87',
        name: 'Unapplied Cash Payment Income',
        fully_qualified_name: 'Unapplied Cash Payment Income',
        parent_ref: '',
      },
      {
        id: '30',
        name: 'Uncategorized Income',
        fully_qualified_name: 'Uncategorized Income',
        parent_ref: '',
      },
    ],
    qb_income_account_id: '47',
    tax_rate_map: [
      {
        id: '11',
        name: 'California, Contra Costa County',
        rate: 1,
      },
      {
        id: '12',
        name: 'California, Contra Costa County District',
        rate: 1.5,
      },
      {
        id: '10',
        name: 'California State',
        rate: 6.25,
      },
      {
        id: '14',
        name: 'New York State',
        rate: 4,
      },
      {
        id: '1',
        name: 'AZ State tax',
        rate: 7.1,
      },
      {
        id: '3',
        name: 'California',
        rate: 8,
      },
      {
        id: '5',
        name: 'Dummy Tax Rate',
        rate: 5,
      },
      {
        id: '6',
        name: 'Dummy Tax RateX',
        rate: 5,
      },
      {
        id: '13',
        name: 'California, San Pablo City District',
        rate: 0.75,
      },
      {
        id: '15',
        name: 'New York, New York City',
        rate: 4.875,
      },
      {
        id: '4',
        name: 'GG',
        rate: 12,
      },
      {
        id: '16',
        name: 'huhu',
        rate: 10,
      },
      {
        id: '9',
        name: 'NO TAX PURCHASE',
        rate: 0,
      },
      {
        id: '8',
        name: 'NO TAX SALES',
        rate: 0,
      },
      {
        id: '7',
        name: 'Sales Tax Code',
        rate: 5,
      },
      {
        id: '2',
        name: 'Tucson City',
        rate: 2,
      },
    ],
    automatic_taxes: true,
    default_taxable_code: null,
    default_exempt_code: null,
    country: null,
  },
};

export function useQuickbooksConnection() {
  const company = useCurrentCompany();

  const quickbooks: Quickbooks | undefined = company?.quickbooks;

  return { quickbooks, isConnected: Boolean(quickbooks) };
}
