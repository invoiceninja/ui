/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEntityCustomFields } from '$app/common/hooks/useEntityCustomFields';
import { useTranslation } from 'react-i18next';

export interface CreditRuleField {
  key: string;
  label: string;
  type: 'string' | 'number';
}

export function useCreditRuleFields(): CreditRuleField[] {
  const [t] = useTranslation();

  const [invoiceCustom1, invoiceCustom2, invoiceCustom3, invoiceCustom4] =
    useEntityCustomFields({ entity: 'invoice' });

  const [paymentCustom1, paymentCustom2, paymentCustom3, paymentCustom4] =
    useEntityCustomFields({ entity: 'payment' });

  const [clientCustom1, clientCustom2, clientCustom3, clientCustom4] =
    useEntityCustomFields({ entity: 'client' });

  const fields: CreditRuleField[] = [
    { key: '$invoice.number', label: t('invoice_number'), type: 'string' },
    { key: '$invoice.po_number', label: t('po_number'), type: 'string' },
    { key: '$invoice.amount', label: t('invoice_amount'), type: 'number' },
    { key: '$invoice.custom1', label: invoiceCustom1, type: 'string' },
    { key: '$invoice.custom2', label: invoiceCustom2, type: 'string' },
    { key: '$invoice.custom3', label: invoiceCustom3, type: 'string' },
    { key: '$invoice.custom4', label: invoiceCustom4, type: 'string' },
    { key: '$payment.amount', label: t('payment_amount'), type: 'number' },
    {
      key: '$payment.transaction_reference',
      label: t('transaction_reference'),
      type: 'string',
    },
    { key: '$payment.custom1', label: paymentCustom1, type: 'string' },
    { key: '$payment.custom2', label: paymentCustom2, type: 'string' },
    { key: '$payment.custom3', label: paymentCustom3, type: 'string' },
    { key: '$payment.custom4', label: paymentCustom4, type: 'string' },
    { key: '$client.id_number', label: t('id_number'), type: 'string' },
    { key: '$client.email', label: t('client_email'), type: 'string' },
    { key: '$client.custom1', label: clientCustom1, type: 'string' },
    { key: '$client.custom2', label: clientCustom2, type: 'string' },
    { key: '$client.custom3', label: clientCustom3, type: 'string' },
    { key: '$client.custom4', label: clientCustom4, type: 'string' },
  ];

  return fields;
}
