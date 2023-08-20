/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { trans } from '$app/common/helpers';
import { useTranslation } from 'react-i18next';

interface NotificationOptionType {
  key: string;
  label: string;
}

export function useNotificationOptions() {
  const [t] = useTranslation();

  const options: NotificationOptionType[] = [
    {
      key: 'invoice_created',
      label: t('invoice_created'),
    },
    {
      key: 'invoice_sent',
      label: trans('invoice_sent', { count: '' }),
    },
    {
      key: 'invoice_viewed',
      label: t('invoice_viewed'),
    },
    {
      key: 'invoice_late',
      label: t('invoice_late'),
    },
    {
      key: 'inventory_threshold',
      label: t('inventory_threshold'),
    },
    {
      key: 'payment_success',
      label: t('payment_success'),
    },
    {
      key: 'payment_failure',
      label: t('payment_failure'),
    },
    {
      key: 'payment_manual',
      label: t('manual_payment'),
    },
    {
      key: 'purchase_order_created',
      label: t('purchase_order_created'),
    },
    {
      key: 'purchase_order_sent',
      label: t('purchase_order_sent'),
    },
    {
      key: 'purchase_order_viewed',
      label: t('purchase_order_viewed'),
    },
    {
      key: 'purchase_order_accepted',
      label: t('purchase_order_accepted'),
    },
    {
      key: 'quote_created',
      label: t('quote_created'),
    },
    { key: 'quote_sent', label: t('quote_sent') },
    {
      key: 'quote_viewed',
      label: t('quote_viewed'),
    },
    {
      key: 'quote_approved',
      label: t('quote_approved'),
    },
    {
      key: 'quote_expired',
      label: t('quote_expired'),
    },
    {
      key: 'credit_created',
      label: t('credit_created'),
    },
    {
      key: 'credit_sent',
      label: t('credit_sent'),
    },
    {
      key: 'credit_viewed',
      label: t('credit_viewed'),
    },
  ];

  return options;
}
