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
import { useTaxRatesQuery } from 'common/queries/tax-rates';
import { TaxRate } from 'common/interfaces/tax-rate';
import { useCurrentCompany } from '../useCurrentCompany';
import { usePlan } from 'common/guards/guards/free-plan';

interface EntityAction {
  key: string;
  url: string;
  section: 'income' | 'expense' | 'settings';
  externalLink?: boolean;
  visible: boolean;
}

export function useQuickCreateActions() {
  const currentCompany = useCurrentCompany();

  const { data: gatewaysData } = useCompanyGatewaysQuery();
  const { data: bankAccountsData } = useBankAccountsQuery();
  const { data: taxRatesData } = useTaxRatesQuery({});
  const { enterprisePlan } = usePlan();

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
    },
    {
      key: 'product',
      url: '/products/create',
      section: 'income',
      visible: true,
    },
    {
      key: 'invoice',
      url: '/invoices/create',
      section: 'income',
      visible: true,
    },
    {
      key: 'recurring_invoice',
      url: '/recurring_invoices/create',
      section: 'income',
      visible: true,
    },
    {
      key: 'quote',
      url: '/quotes/create',
      section: 'income',
      visible: true,
    },
    {
      key: 'credit',
      url: '/credits/create',
      section: 'income',
      visible: true,
    },
    {
      key: 'payment',
      url: '/payments/create',
      section: 'income',
      visible: true,
    },
    {
      key: 'subscription',
      url: '/settings/subscription/create',
      section: 'income',
      visible: true,
    },
    {
      key: 'expense',
      url: '/expenses/create',
      section: 'expense',
      visible: true,
    },
    {
      key: 'purchase_order',
      url: '/purchase_orders/create',
      section: 'expense',
      visible: true,
    },
    {
      key: 'vendor',
      url: '/vendors/create',
      section: 'expense',
      visible: true,
    },
    {
      key: 'transaction',
      url: '/transactions/create',
      section: 'expense',
      visible: true,
    },
    {
      key: 'add_stripe',
      url: '/settings/gateways/create',
      section: 'settings',
      visible: Boolean(!gateways?.length),
    },
    {
      key: 'connect_bank',
      url: '/settings/bank_accounts/create',
      section: 'settings',
      visible: enterprisePlan && Boolean(!bankAccounts?.length),
    },
    {
      key: 'tax_settings',
      url: '/settings/tax_rates/create',
      section: 'settings',
      visible: Boolean(!taxRates?.length),
    },
    {
      key: 'add_company_logo',
      url: '/settings/company_details/logo',
      section: 'settings',
      visible: Boolean(!currentCompany?.settings.company_logo),
    },
    {
      key: 'templates_and_reminders',
      url: '/settings/templates_and_reminders',
      section: 'settings',
      visible: true,
    },
  ];

  return actions;
}
