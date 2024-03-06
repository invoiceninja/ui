/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { enterprisePlan } from '$app/common/guards/guards/enterprise-plan';
import { proPlan } from '$app/common/guards/guards/pro-plan';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useTranslation } from 'react-i18next';

export function useTabs() {
  const [t] = useTranslation();

  const company = useCompanyChanges();

  let tabs = [t('client_details')];

  const hiddenTabs = company?.settings.sync_invoice_quote_columns
    ? [t('quote_product_columns')]
    : [];

  if (proPlan() || enterprisePlan()) {
    tabs = [
      ...tabs,
      ...[
        t('company_details'),
        t('company_address'),
        t('invoice_details'),
        t('quote_details'),
        t('credit_details'),
        t('vendor_details'),
        t('purchase_order_details'),
        company?.settings.sync_invoice_quote_columns
          ? t('product_columns')
          : t('invoice_product_columns'),
        t('quote_product_columns'),
        t('task_columns'),
        t('total_fields'),
      ],
    ];
  }

  return { tabs, hiddenTabs };
}
