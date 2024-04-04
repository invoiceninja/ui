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
    dependencies: [
      '/api/v1/clients',
      '/api/v1/charts/totals_v2',
      '/api/v1/charts/chart_summary_v2',
      '/api/v1/activities/entity',
      '/api/v1/activities',
      '/api/v1/documents',
    ],
  },
  designs: {
    path: '/api/v1/designs',
    dependencies: [
      '/api/v1/invoices',
      '/api/v1/quotes',
      '/api/v1/credits',
      '/api/v1/recurring_invoices',
      '/api/v1/purchase_orders',
    ],
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
    dependencies: ['/api/v1/clients', '/api/v1/documents'],
  },
  expense_categories: {
    path: '/api/v1/expense_categories',
    dependencies: [
      '/api/v1/expenses',
      '/api/v1/recurring_expenses',
      '/api/v1/bank_transaction_rules',
      '/api/v1/vendors',
      '/api/v1/bank_transactions',
    ],
  },
  expenses: {
    path: '/api/v1/expenses',
    dependencies: [
      '/api/v1/charts/totals_v2',
      '/api/v1/charts/chart_summary_v2',
      '/api/v1/documents',
    ],
  },
  group_settings: {
    path: '/api/v1/group_settings',
    dependencies: ['/api/v1/clients'],
  },
  payments: {
    path: '/api/v1/payments',
    dependencies: [
      '/api/v1/expenses',
      '/api/v1/invoices',
      '/api/v1/clients',
      '/api/v1/charts/totals_v2',
      '/api/v1/charts/chart_summary_v2',
      '/api/v1/activities',
      '/api/v1/documents',
    ],
  },
  purchase_orders: {
    path: '/api/v1/purchase_orders',
    dependencies: ['/api/v1/vendors'],
  },
  recurring_expenses: {
    path: '/api/v1/recurring_expenses',
    dependencies: ['/api/v1/vendors', '/api/v1/documents'],
  },
  task_statuses: {
    path: '/api/v1/task_statuses',
    dependencies: ['/api/v1/tasks'],
  },
  tasks: {
    path: '/api/v1/tasks',
    dependencies: ['/api/v1/projects', '/api/v1/documents'],
  },
  tax_rates: {
    path: '/api/v1/tax_rates',
    dependencies: [
      '/api/v1/invoices',
      '/api/v1/quotes',
      '/api/v1/credits',
      '/api/v1/recurring_invoices',
      '/api/v1/purchase_orders',
    ],
  },
  bank_transactions: {
    path: '/api/v1/bank_transactions',
    dependencies: [
      '/api/v1/payments',
      '/api/v1/invoices',
      '/api/v1/vendors',
      '/api/v1/expenses',
      '/api/v1/expense_categories',
    ],
  },
  bank_transaction_rules: {
    path: '/api/v1/bank_transaction_rules',
    dependencies: ['/api/v1/bank_transactions'],
  },
  vendors: {
    path: '/api/v1/vendors',
    dependencies: [
      '/api/v1/expenses',
      '/api/v1/recurring_expenses',
      '/api/v1/purchase_orders',
    ],
  },
  users: {
    path: '/api/v1/users',
    dependencies: [
      '/api/v1/tasks',
      '/api/v1/invoices',
      '/api/v1/quotes',
      '/api/v1/credits',
      '/api/v1/recurring_invoices',
      '/api/v1/projects',
      '/api/v1/payments',
      '/api/v1/expenses',
      '/api/v1/tasks',
    ],
  },
  company_users: {
    path: '/api/v1/company_users',
    dependencies: [],
  },
  clients: {
    path: '/api/v1/clients',
    dependencies: [
      '/api/v1/tasks',
      '/api/v1/invoices',
      '/api/v1/quotes',
      '/api/v1/credits',
      '/api/v1/recurring_invoices',
      '/api/v1/projects',
      '/api/v1/payments',
      '/api/v1/expenses',
      '/api/v1/tasks',
      '/api/v1/charts/totals_v2',
      '/api/v1/charts/chart_summary_v2',
      '/api/v1/documents',
    ],
  },
  products: {
    path: '/api/v1/products',
    dependencies: ['/api/v1/subscriptions', '/api/v1/invoices'],
  },
  projects: {
    path: '/api/v1/projects',
    dependencies: ['/api/v1/tasks', '/api/v1/documents'],
  },
  quotes: {
    path: '/api/v1/quotes',
    dependencies: [
      '/api/v1/clients',
      '/api/v1/activities',
      '/api/v1/documents',
    ],
  },
  recurring_invoices: {
    path: '/api/v1/recurring_invoices',
    dependencies: [
      '/api/v1/clients',
      '/api/v1/activities/entity',
      '/api/v1/documents',
    ],
  },
  bank_integrations: {
    path: '/api/v1/bank_integrations',
    dependencies: ['/api/v1/bank_transactions'],
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
  activities: {
    path: '/api/v1/activities',
    dependencies: ['/api/v1/activities/entity'],
  },
};

export function useRefetch() {
  const queryClient = useQueryClient();

  return (property: Array<keyof typeof keys>) => {
    property.map((key) => {
      if (!keys[key]) {
        return;
      }

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

export function getRefetchKeyByUrl(endpoint: string) {
  const key = Object.keys(keys).find(
    (key) =>
      keys[key as keyof typeof keys].path.startsWith(endpoint) ||
      endpoint.startsWith(keys[key as keyof typeof keys].path)
  );

  return key;
}

/**
 * Use with caution. Generally you should avoid using this,
 * and only use it when you know what you're doing. Prefer $refetch over this.
 *
 * This is fallback for states where $refetch is not available as we don't know plain string/resource,
 * we are working it so we have to fallback to domain lookup.
 *
 * @param endpoint string[]
 */
export function refetchByUrl(endpoint: string[]) {
  endpoint.map((url) => {
    const key = getRefetchKeyByUrl(url);

    if (key) {
      $refetch([key as keyof typeof keys]);
    }
  });
}
