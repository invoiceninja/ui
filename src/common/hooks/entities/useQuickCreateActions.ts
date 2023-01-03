/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useCompanyGatewaysQuery } from 'common/queries/company-gateways';
import { useEffect, useState } from 'react';
import { CompanyGateway } from 'common/interfaces/company-gateway';
import { BankAccount } from 'common/interfaces/bank-accounts';
import { useBankAccountsQuery } from 'pages/settings/bank-accounts/common/queries';
import { enterprisePlan } from 'common/guards/guards/enterprise-plan';
import { useTaxRatesQuery } from 'common/queries/tax-rates';
import { TaxRate } from 'common/interfaces/tax-rate';
import { useCurrentCompany } from '../useCurrentCompany';

interface EntityAction {
  key: string;
  url: string;
  section: 'income' | 'expense' | 'settings';
  externalLink?: boolean;
  visible: boolean;
  helperText: string;
}

export function useQuickCreateActions() {
  const currentCompany = useCurrentCompany();

  const { data: gatewaysData } = useCompanyGatewaysQuery();

  const { data: bankAccountsData } = useBankAccountsQuery();

  const { data: taxRatesData } = useTaxRatesQuery({});

  const [gateways, setGateways] = useState<CompanyGateway[]>();

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>();

  const [taxRates, setTaxRates] = useState<TaxRate[]>();

  useEffect(() => {
    if (gatewaysData) {
      setGateways(gatewaysData.data.data);
    }

    if (bankAccountsData) {
      setBankAccounts(bankAccountsData);
    }

    if (taxRatesData) {
      setTaxRates(taxRatesData.data.data);
    }
  }, [gatewaysData, bankAccountsData, taxRatesData]);

  const actions: EntityAction[] = [
    {
      key: 'client',
      url: '/clients/create',
      section: 'income',
      visible: true,
      helperText: 'Speak directly to your customers in a more meaningful way.',
    },
    {
      key: 'product',
      url: '/products/create',
      section: 'income',
      visible: true,
      helperText: 'Speak directly to your customers in a more meaningful way.',
    },
    {
      key: 'invoice',
      url: '/invoices/create',
      section: 'income',
      visible: true,
      helperText: 'Speak directly to your customers in a more meaningful way.',
    },
    {
      key: 'recurring_invoice',
      url: '/recurring_invoices/create',
      section: 'income',
      visible: true,
      helperText: 'Speak directly to your customers in a more meaningful way.',
    },
    {
      key: 'quote',
      url: '/quotes/create',
      section: 'income',
      visible: true,
      helperText: 'Speak directly to your customers in a more meaningful way.',
    },
    {
      key: 'credit',
      url: '/credits/create',
      section: 'income',
      visible: true,
      helperText: 'Speak directly to your customers in a more meaningful way.',
    },
    {
      key: 'payment',
      url: '/payments/create',
      section: 'income',
      visible: true,
      helperText: 'Speak directly to your customers in a more meaningful way.',
    },
    {
      key: 'subscription',
      url: '/settings/subscription/create',
      section: 'income',
      visible: true,
      helperText: 'Speak directly to your customers in a more meaningful way.',
    },
    {
      key: 'expense',
      url: '/expenses/create',
      section: 'expense',
      visible: true,
      helperText: 'Speak directly to your customers in a more meaningful way.',
    },
    {
      key: 'purchase_order',
      url: '/purchase_orders/create',
      section: 'expense',
      visible: true,
      helperText: 'Speak directly to your customers in a more meaningful way.',
    },
    {
      key: 'vendor',
      url: '/vendors/create',
      section: 'expense',
      visible: true,
      helperText: 'Speak directly to your customers in a more meaningful way.',
    },
    {
      key: 'transaction',
      url: '/transactions/create',
      section: 'expense',
      visible: true,
      helperText: 'Speak directly to your customers in a more meaningful way.',
    },
    {
      key: 'add_stripe',
      url: '/settings/gateways/create',
      section: 'settings',
      visible: Boolean(gateways?.length),
      helperText: 'Speak directly to your customers in a more meaningful way.',
    },
    {
      key: 'connect_bank',
      url: '/settings/bank_accounts/create',
      section: 'settings',
      visible: enterprisePlan() && Boolean(bankAccounts?.length),
      helperText: 'Speak directly to your customers in a more meaningful way.',
    },
    {
      key: 'tax_settings',
      url: '/settings/tax_rates/create',
      section: 'settings',
      visible: Boolean(taxRates?.length),
      helperText: 'Speak directly to your customers in a more meaningful way.',
    },
    {
      key: 'add_company_logo',
      url: '/settings/company_details/logo',
      section: 'settings',
      visible: Boolean(!currentCompany?.settings?.company_logo),
      helperText: 'Speak directly to your customers in a more meaningful way.',
    },
    {
      key: 'templates_and_reminders',
      url: '/settings/templates_and_reminders',
      section: 'settings',
      visible: true,
      helperText: 'Speak directly to your customers in a more meaningful way.',
    },
  ];

  return actions;
}
