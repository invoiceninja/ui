/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { InvoiceStatus } from '$app/common/enums/invoice-status';
import { route } from '$app/common/helpers/route';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { Invoice } from '$app/common/interfaces/invoice';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import { Tab } from '$app/components/Tabs';
import { ValidationEntityResponse } from '$app/pages/settings/e-invoice/common/hooks/useCheckEInvoiceValidation';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

interface Params {
  invoice: Invoice | undefined;
  eInvoiceValidationResponse?: ValidationEntityResponse | undefined;
}
export function useTabs(params: Params) {
  const [t] = useTranslation();

  const company = useCurrentCompany();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const { id } = useParams();

  const { invoice, eInvoiceValidationResponse } = params;

  const canEditAndView =
    hasPermission('view_invoice') ||
    hasPermission('edit_invoice') ||
    entityAssigned(invoice);

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/invoices/:id/edit', { id }),
    },
    {
      name: t('e_invoice'),
      href: route('/invoices/:id/e_invoice', { id }),
      enabled: Boolean(
        company?.settings.e_invoice_type === 'PEPPOL' &&
          company?.settings.enable_e_invoice &&
          company?.tax_data?.acts_as_sender
      ),
      formatName: () => (
        <div className="flex space-x-1">
          <span>{t('e_invoice')}</span>

          {Boolean(
            eInvoiceValidationResponse?.client.length ||
              eInvoiceValidationResponse?.company.length ||
              eInvoiceValidationResponse?.invoice.length
          ) && (
            <span className="font-bold">
              (
              {(eInvoiceValidationResponse?.client.length || 0) +
                (eInvoiceValidationResponse?.company.length || 0) +
                (eInvoiceValidationResponse?.invoice.length || 0)}
              )
            </span>
          )}
        </div>
      ),
    },
    {
      name: t('documents'),
      href: route('/invoices/:id/documents', { id }),
      enabled: canEditAndView,
      formatName: () => (
        <DocumentsTabLabel numberOfDocuments={invoice?.documents?.length} />
      ),
    },
    {
      name: t('settings'),
      href: route('/invoices/:id/settings', { id }),
    },
    {
      name: t('activity'),
      href: route('/invoices/:id/activity', { id }),
    },
    {
      name: t('history'),
      href: route('/invoices/:id/history', { id }),
    },
    {
      name: t('email_history'),
      href: route('/invoices/:id/email_history', { id }),
    },
    {
      name: t('payments'),
      href: route('/invoices/:id/payments', { id }),
      enabled: invoice?.status_id === InvoiceStatus.Paid,
    },
  ];

  return tabs;
}
