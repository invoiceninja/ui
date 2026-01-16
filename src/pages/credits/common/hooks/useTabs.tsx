/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { route } from '$app/common/helpers/route';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { Credit } from '$app/common/interfaces/credit';
import { DocumentsTabLabel } from '$app/components/DocumentsTabLabel';
import { Tab } from '$app/components/Tabs';
import { ValidationEntityResponse } from '$app/pages/settings/e-invoice/common/hooks/useCheckEInvoiceValidation';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

interface Params {
  credit: Credit | undefined;
  eInvoiceValidationResponse?: ValidationEntityResponse | undefined;
}

export function useTabs({ credit, eInvoiceValidationResponse }: Params) {
  const [t] = useTranslation();

  const { id } = useParams();
  const company = useCurrentCompany();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const canEditAndView =
    hasPermission('view_credit') ||
    hasPermission('edit_credit') ||
    entityAssigned(credit);

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/credits/:id/edit', { id }),
    },
    {
      name: t('e_invoice'),
      href: route('/credits/:id/e_invoice', { id }),
      enabled:
        company?.settings.enable_e_invoice === true ||
        company?.settings.e_invoice_type === 'PEPPOL',
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
      href: route('/credits/:id/documents', { id }),
      enabled: canEditAndView,
      formatName: () => (
        <DocumentsTabLabel numberOfDocuments={credit?.documents?.length} />
      ),
    },
    {
      name: t('settings'),
      href: route('/credits/:id/settings', { id }),
    },
    {
      name: t('activity'),
      href: route('/credits/:id/activity', { id }),
    },
    {
      name: t('history'),
      href: route('/credits/:id/history', { id }),
    },
  ];

  return tabs;
}
