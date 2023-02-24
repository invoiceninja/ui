/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { customField } from 'components/CustomField';
import { useCurrentCompany } from 'common/hooks/useCurrentCompany';

export function useAllInvoiceColumns() {
  const [t] = useTranslation();
  const company = useCurrentCompany();
  const customFields = company?.custom_fields;

  const invoiceColumns = [
    'status',
    'number',
    'amount',
    'client',
    'balance',
    'date',
    'due_date',
    'auto_bill_enabled',
    'client_postal_code',
    'archived_at',
    'client_city',
    'client_country',
    'client_state',
    'contact_email',
    'contact_name',
    customFields?.invoice1
      ? customField(customFields.invoice1).label()
      : t('custom1'),
    customFields?.invoice2
      ? customField(customFields.invoice2).label()
      : t('custom2'),
    customFields?.invoice3
      ? customField(customFields.invoice3).label()
      : t('custom3'),
    customFields?.invoice4
      ? customField(customFields.invoice4).label()
      : t('custom4'),
    'discount',
    'documents',
    'entity_state',
    'exchange_rate',
    'is_deleted',
    'is_viewed',
    'last_sent_date',
    'last_sent_template',
    'next_send_date',
    'partial_due',
    'partial_due_date',
    'po_number',
    'private_notes',
    'public_notes',
    'reminder1_sent',
    'reminder2_sent',
    'reminder3_sent',
    'reminder_last_sent',
    'tax_amount',
    'created_at',
    'updated_at',
  ] as const;

  return invoiceColumns;
}
