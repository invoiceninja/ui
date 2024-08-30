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
import { Tabs } from '$app/components/Tabs';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams, useSearchParams } from 'react-router-dom';
import { useActions } from './edit/components/Actions';
import { useHandleSave } from './edit/hooks/useInvoiceSave';
import { invoiceAtom } from './common/atoms';
import { useEffect, useState } from 'react';
import { CommonActions } from './edit/components/CommonActions';
import { InvoiceStatus } from '$app/common/enums/invoice-status';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { useTabs } from './common/hooks/useTabs';
import { useInvoiceQuery } from '$app/common/queries/invoices';
import { cloneDeep } from 'lodash';
import { v4 } from 'uuid';
import { Client } from '$app/common/interfaces/client';
import { useInvoiceUtilities } from './create/hooks/useInvoiceUtilities';
import { Spinner } from '$app/components/Spinner';
import { AddUninvoicedItemsButton } from './common/components/AddUninvoicedItemsButton';
import { useAtom } from 'jotai';

export default function Invoice() {
  const { documentTitle } = useTitle('edit_invoice');

  const [t] = useTranslation();

  const { id } = useParams();

  const [searchParams] = useSearchParams();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const actions = useActions();

  const { data } = useInvoiceQuery({ id });

  const [client, setClient] = useState<Client | undefined>();

  const { calculateInvoiceSum } = useInvoiceUtilities({ client });

  const [invoice, setInvoice] = useAtom(invoiceAtom);

  const [errors, setErrors] = useState<ValidationBag>();
  const [isDefaultTerms, setIsDefaultTerms] = useState<boolean>(false);
  const [isDefaultFooter, setIsDefaultFooter] = useState<boolean>(false);

  const save = useHandleSave({ setErrors, isDefaultTerms, isDefaultFooter });

  const tabs = useTabs({ invoice });

  const pages: Page[] = [
    { name: t('invoices'), href: '/invoices' },
    { name: t('edit_invoice'), href: route('/invoices/:id/edit', { id }) },
  ];

  useEffect(() => {
    const isAnyAction = searchParams.get('action');

    const currentInvoice = isAnyAction && invoice ? invoice : data;

    if (currentInvoice) {
      const _invoice = cloneDeep(currentInvoice);

      _invoice.line_items.map((lineItem) => (lineItem._id = v4()));

      setInvoice(_invoice);

      if (_invoice?.client) {
        setClient(_invoice.client);
      }
    }
  }, [data]);

  useEffect(() => {
    invoice && calculateInvoiceSum(invoice);
  }, [invoice]);

  return (
    <>
      <Default
        title={documentTitle}
        breadcrumbs={pages}
        {...((hasPermission('edit_invoice') || entityAssigned(invoice)) &&
          invoice && {
            navigationTopRight: (
              <ResourceActions
                resource={invoice}
                actions={actions}
                onSaveClick={() => save(invoice)}
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
        {invoice?.id === id ? (
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
                client,
              }}
            />
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <Spinner />
          </div>
        )}
      </Default>

      <AddUninvoicedItemsButton invoice={invoice} setInvoice={setInvoice} />
    </>
  );
}
