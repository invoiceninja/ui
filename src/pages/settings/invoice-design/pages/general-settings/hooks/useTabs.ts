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
import { route } from '$app/common/helpers/route';
import { useCompanyChanges } from '$app/common/hooks/useCompanyChanges';
import { useCurrentSettingsLevel } from '$app/common/hooks/useCurrentSettingsLevel';
import { Tab } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';

export function useTabs() {
  const [t] = useTranslation();

  const company = useCompanyChanges();
  const { isCompanySettingsActive } = useCurrentSettingsLevel();

  const tabs: Tab[] = [
    { name: t('general_settings'), href: '/settings/invoice_design' },
    {
      name: t('custom_designs'),
      href: '/settings/invoice_design/custom_designs',
      matcher: [
        () => '/settings/invoice_design/custom_designs/create',
        (params) =>
          route('/settings/invoice_design/custom_designs/:id/edit', params),
      ],
      enabled: isCompanySettingsActive,
    },
    {
      name: t('client_details'),
      href: '/settings/invoice_design/client_details',
      enabled: isCompanySettingsActive,
    },
    {
      name: t('company_details'),
      href: '/settings/invoice_design/company_details',
      enabled: isCompanySettingsActive && (proPlan() || enterprisePlan()),
    },
    {
      name: t('company_address'),
      href: '/settings/invoice_design/company_address',
      enabled: isCompanySettingsActive && (proPlan() || enterprisePlan()),
    },
    {
      name: t('invoice_details'),
      href: '/settings/invoice_design/invoice_details',
      enabled: isCompanySettingsActive && (proPlan() || enterprisePlan()),
    },
    {
      name: t('quote_details'),
      href: '/settings/invoice_design/quote_details',
      enabled: isCompanySettingsActive && (proPlan() || enterprisePlan()),
    },
    {
      name: t('credit_details'),
      href: '/settings/invoice_design/credit_details',
      enabled: isCompanySettingsActive && (proPlan() || enterprisePlan()),
    },
    {
      name: t('vendor_details'),
      href: '/settings/invoice_design/vendor_details',
      enabled: isCompanySettingsActive && (proPlan() || enterprisePlan()),
    },
    {
      name: t('purchase_order_details'),
      href: '/settings/invoice_design/purchase_order_details',
      enabled: isCompanySettingsActive && (proPlan() || enterprisePlan()),
    },
    {
      name: company?.settings.sync_invoice_quote_columns
        ? t('product_columns')
        : t('invoice_product_columns'),
      href: '/settings/invoice_design/product_columns',
      enabled: isCompanySettingsActive && (proPlan() || enterprisePlan()),
    },
    {
      name: t('quote_product_columns'),
      href: '/settings/invoice_design/quote_product_columns',
      enabled:
        isCompanySettingsActive &&
        (proPlan() || enterprisePlan()) &&
        !company?.settings.sync_invoice_quote_columns,
    },
    {
      name: t('task_columns'),
      href: '/settings/invoice_design/task_columns',
      enabled: isCompanySettingsActive && (proPlan() || enterprisePlan()),
    },
    {
      name: t('total_fields'),
      href: '/settings/invoice_design/total_fields',
      enabled: isCompanySettingsActive && (proPlan() || enterprisePlan()),
    },
  ];

  return tabs;
}
