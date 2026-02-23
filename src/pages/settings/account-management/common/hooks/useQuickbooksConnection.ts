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
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ',
  refresh_token:
    'L011234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789',
  realmID: '9130353738046124',
  accessTokenExpiresAt: Date.now() + 3600 * 1000, // expires in 1 hour
  refreshTokenExpiresAt: Date.now() + 100 * 24 * 3600 * 1000, // expires in 100 days
  baseURL: 'https://sandbox-quickbooks.api.intuit.com',
  companyName: 'Acme Corporation',
  settings: {
    client: {
      direction: QuickbooksSyncDirection.Bidirectional,
    },
    invoice: {
      direction: QuickbooksSyncDirection.Push,
    },
    vendor: {
      direction: QuickbooksSyncDirection.Pull,
    },
    sales: {
      direction: QuickbooksSyncDirection.Push,
    },
    quote: {
      direction: QuickbooksSyncDirection.None,
    },
    purchase_order: {
      direction: QuickbooksSyncDirection.Bidirectional,
    },
    product: {
      direction: QuickbooksSyncDirection.Bidirectional,
    },
    payment: {
      direction: QuickbooksSyncDirection.Push,
    },
    expense: {
      direction: QuickbooksSyncDirection.Bidirectional,
    },
    expense_category: {
      direction: QuickbooksSyncDirection.Pull,
    },
    income_account_map: [
      {
        id: '79',
        name: 'Sales of Product Income',
        fully_qualified_name: 'Sales of Product Income',
      },
      {
        id: '82',
        name: 'Services',
        fully_qualified_name: 'Income:Services',
      },
      {
        id: '85',
        name: 'Consulting Income',
        fully_qualified_name: 'Income:Consulting Income',
      },
    ],
    qb_income_account_id: '79',
    tax_rate_map: [
      ['1', 'Sales Tax', '8.50'],
      ['2', 'VAT Standard', '20.00'],
      ['3', 'State Tax - CA', '7.25'],
    ],
    automatic_taxes: true,
    default_income_account: '79',
  },
};

export function useQuickbooksConnection() {
  const company = useCurrentCompany();

  const quickbooks: Quickbooks | undefined = company?.quickbooks;

  return { quickbooks, isConnected: Boolean(quickbooks) };
}
