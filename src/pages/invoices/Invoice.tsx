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
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { Default } from '$app/components/layouts/Default';
import { ResourceActions } from '$app/components/ResourceActions';
import { Tab, Tabs } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';
import { useActions } from './edit/components/Actions';
import { useHandleSave } from './edit/hooks/useInvoiceSave';
import { useAtom } from 'jotai';
import { invoiceAtom } from './common/atoms';
import { useState } from 'react';
import { CommonActions } from './edit/components/CommonActions';
import { InvoiceStatus } from '$app/common/enums/invoice-status';
import { ValidationBag } from '$app/common/interfaces/validation-bag';

export default function Invoice() {
  const { documentTitle } = useTitle('edit_invoice');

  const [t] = useTranslation();

  const { id } = useParams();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const actions = useActions();

  const [invoice, setInvoice] = useAtom(invoiceAtom);

  const [errors, setErrors] = useState<ValidationBag>();
  const [isDefaultTerms, setIsDefaultTerms] = useState<boolean>(false);
  const [isDefaultFooter, setIsDefaultFooter] = useState<boolean>(false);

  const save = useHandleSave({ setErrors, isDefaultTerms, isDefaultFooter });

  const pages: Page[] = [
    { name: t('invoices'), href: '/invoices' },
    { name: t('edit_invoice'), href: route('/invoices/:id/edit', { id }) },
  ];

  const tabs: Tab[] = [
    {
      name: t('edit'),
      href: route('/invoices/:id/edit', { id }),
    },
    {
      name: t('e_invoice'),
      href: route('/invoices/:id/e_invoice', { id }),
    },
  ];

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      {...((hasPermission('edit_invoice') || entityAssigned(invoice)) &&
        invoice && {
          navigationTopRight: (
            <ResourceActions
              resource={invoice}
              actions={actions}
              onSaveClick={() => invoice && save(invoice)}
              disableSaveButton={
                invoice &&
                (invoice.status_id === InvoiceStatus.Cancelled ||
                  invoice.is_deleted)
              }
              cypressRef="invoiceActionDropdown"
            />
          ),
          topRight: <CommonActions invoice={invoice} />,
        })}
    >
      <div className="space-y-4">
        <Tabs tabs={tabs} />

        <Outlet
          context={{
            invoice,
            setInvoice,
            errors,
            isDefaultTerms,
            setIsDefaultTerms,
            isDefaultFooter,
            setIsDefaultFooter,
          }}
        />
      </div>
    </Default>
  );
}
