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
  purchase_orders: {
    path: '/api/v1/purchase_orders',
    dependencies: [],
  },
  recurring_expenses: {
    path: '/api/v1/recurring_expenses',
    dependencies: [],
  },
  task_statuses: {
    path: '/api/v1/task_statuses',
    dependencies: [],
  },
  tasks: {
    path: '/api/v1/tasks',
    dependencies: [],
  },
  tax_rates: {
    path: '/api/v1/tax_rates',
    dependencies: [],
  },
  bank_transactions: {
    path: '/api/v1/bank_transactions',
    dependencies: [],
  },
  bank_transaction_rules: {
    path: '/api/v1/bank_transaction_rules',
    dependencies: [],
  },
  vendors: {
    path: '/api/v1/vendors',
    dependencies: [],
  },
  users: {
    path: '/api/v1/users',
    dependencies: [],
  },
  company_users: {
    path: '/api/v1/company_users',
    dependencies: [],
  },
  clients: {
    path: '/api/v1/clients',
    dependencies: [],
  },
  products: {
    path: '/api/v1/products',
    dependencies: [],
  },
  projects: {
    path: '/api/v1/projects',
    dependencies: [],
  },
  quotes: {
    path: '/api/v1/quotes',
    dependencies: [],
  },
  recurring_invoices: {
    path: '/api/v1/recurring_invoices',
    dependencies: [],
  },
  bank_integrations: {
    path: '/api/v1/bank_integrations',
    dependencies: [],
  },
  documents: {
    path: '/api/v1/documents',
    dependencies: [],
  },
  payment_terms: {
    path: '/api/v1/payment_terms',
    dependencies: [],
  },
  statics: {
    path: '/api/v1/statics',
    dependencies: [],
  },
  task_schedulers: {
    path: '/api/v1/task_schedulers',
    dependencies: [],
  },
  subscriptions: {
    path: '/api/v1/subscriptions',
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
