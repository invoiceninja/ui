/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useQueryClient } from 'react-query';

export const keys = {
  invoices: {
    path: '/api/v1/invoices',
    dependencies: [],
  },
  designs: {
    path: '/api/v1/designs',
    dependencies: [],
  },
  tokens: {
    path: '/api/v1/tokens',
    dependencies: [],
  },
  webhooks: {
    path: '/api/v1/webhooks',
    dependencies: [],
  },
  company_gateways: {
    path: '/api/v1/company_gateways',
    dependencies: [],
  },
  credits: {
    path: '/api/v1/credits',
    dependencies: [],
  },
  expense_categories: {
    path: '/api/v1/expense_categories',
    dependencies: [],
  },
  expenses: {
    path: '/api/v1/expenses',
    dependencies: [],
  },
  group_settings: {
    path: '/api/v1/group_settings',
    dependencies: [],
  },
  payments: {
    path: '/api/v1/payments',
    dependencies: [],
  },
};

export function useRefetch() {
  const queryClient = useQueryClient();

  return (property: Array<keyof typeof keys>) => {
    property.map((key) => {
      queryClient.invalidateQueries(keys[key].path);

      keys[key].dependencies.map((dependency) => {
        queryClient.invalidateQueries(dependency);
      });
    });
  };
}

export function $refetch(property: Array<keyof typeof keys>) {
  window.dispatchEvent(
    new CustomEvent('refetch', {
      detail: {
        property,
      },
    })
  );
}
