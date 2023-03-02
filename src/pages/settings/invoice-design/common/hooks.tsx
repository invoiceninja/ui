/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from 'common/helpers/route';
import { Tab } from 'components/Tabs';
import { useTranslation } from 'react-i18next';

export function useInvoiceDesignTabs() {
  const [t] = useTranslation();

  const tabs: Tab[] = [
    {
      name: t('general_settings'),
      href: route('/settings/invoice_design'),
    },
    {
      name: t('client_details'),
      href: route('/settings/invoice_design/client_details'),
    },
    {
      name: t('company_details'),
      href: route('/settings/invoice_design/company_details'),
    },
    {
      name: t('company_address'),
      href: route('/settings/invoice_design/company_address'),
    },
    {
      name: t('invoice_details'),
      href: route('/settings/invoice_design/invoice_details'),
    },
    {
      name: t('quote_details'),
      href: route('/settings/invoice_design/quote_details'),
    },
    {
      name: t('credit_details'),
      href: route('/settings/invoice_design/credit_details'),
    },
    {
      name: t('vendor_details'),
      href: route('/settings/invoice_design/vendor_details'),
    },
    {
      name: t('purchase_order_details'),
      href: route('/settings/invoice_design/purchase_order_details'),
    },
    {
      name: t('product_columns'),
      href: route('/settings/invoice_design/product_columns'),
    },
    {
      name: t('task_columns'),
      href: route('/settings/invoice_design/task_columns'),
    },
    {
      name: t('total_fields'),
      href: route('/settings/invoice_design/total_fields'),
    },
  ];

  return tabs;
}
