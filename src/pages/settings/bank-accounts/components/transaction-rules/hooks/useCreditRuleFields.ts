/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { customField } from '$app/components/CustomField';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useTranslation } from 'react-i18next';

export interface CreditRuleField {
  key: string;
  label: string;
  type: 'string' | 'number';
}

export function useCreditRuleFields(): CreditRuleField[] {
  const [t] = useTranslation();

  const company = useCurrentCompany();
  const customFields = company?.custom_fields;

  const getCustomLabel = (entity: string, index: number) => {
    const raw = customFields?.[`${entity}${index}`];

    return raw ? customField(raw).label() : '';
  };

  const fields: CreditRuleField[] = [
    { key: '$invoice.number', label: t('invoice_number'), type: 'string' },
    { key: '$invoice.po_number', label: t('po_number'), type: 'string' },
    { key: '$invoice.amount', label: t('invoice_amount'), type: 'number' },
    {
      key: '$invoice.custom1',
      label: getCustomLabel('invoice', 1),
      type: 'string',
    },
    {
      key: '$invoice.custom2',
      label: getCustomLabel('invoice', 2),
      type: 'string',
    },
    {
      key: '$invoice.custom3',
      label: getCustomLabel('invoice', 3),
      type: 'string',
    },
    {
      key: '$invoice.custom4',
      label: getCustomLabel('invoice', 4),
      type: 'string',
    },
    { key: '$payment.amount', label: t('payment_amount'), type: 'number' },
    {
      key: '$payment.transaction_reference',
      label: t('transaction_reference'),
      type: 'string',
    },
    {
      key: '$payment.custom1',
      label: getCustomLabel('payment', 1),
      type: 'string',
    },
    {
      key: '$payment.custom2',
      label: getCustomLabel('payment', 2),
      type: 'string',
    },
    {
      key: '$payment.custom3',
      label: getCustomLabel('payment', 3),
      type: 'string',
    },
    {
      key: '$payment.custom4',
      label: getCustomLabel('payment', 4),
      type: 'string',
    },
    { key: '$client.id_number', label: t('id_number'), type: 'string' },
    { key: '$client.email', label: t('client_email'), type: 'string' },
    {
      key: '$client.custom1',
      label: getCustomLabel('client', 1),
      type: 'string',
    },
    {
      key: '$client.custom2',
      label: getCustomLabel('client', 2),
      type: 'string',
    },
    {
      key: '$client.custom3',
      label: getCustomLabel('client', 3),
      type: 'string',
    },
    {
      key: '$client.custom4',
      label: getCustomLabel('client', 4),
      type: 'string',
    },
  ];

  return fields.filter(({ label }) => Boolean(label));
}
