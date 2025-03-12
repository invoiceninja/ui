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
import { useEffect, useRef, useState } from 'react';
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
import { EInvoiceComponent } from '../settings';
import {
  socketId,
  useSocketEvent,
  WithSocketId,
} from '$app/common/queries/sockets';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Banner } from '$app/components/Banner';
import { Invoice as InvoiceType } from '$app/common/interfaces/invoice';
import { useCheckEInvoiceValidation } from '../settings/e-invoice/common/hooks/useCheckEInvoiceValidation';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { PreviousNextNavigation } from '$app/components/PreviousNextNavigation';
import { useAtomWithPrevent } from '$app/common/hooks/useAtomWithPrevent';

dayjs.extend(utc);

export default function Invoice() {
  const { documentTitle } = useTitle('edit_invoice');

  const [t] = useTranslation();

  const eInvoiceRef = useRef<EInvoiceComponent>(null);

  const { id } = useParams();
  const company = useCurrentCompany();
  const [searchParams] = useSearchParams();

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const actions = useActions();

  const [triggerValidationQuery, setTriggerValidationQuery] =
    useState<boolean>(true);

  const { data } = useInvoiceQuery({ id, includeIsLocked: true });

  const [invoice, setInvoice] = useAtomWithPrevent(invoiceAtom, {
    disableFunctionality: id === data?.id && data?.is_locked,
  });

  const { validationResponse } = useCheckEInvoiceValidation({
    resource: invoice,
    enableQuery:
      company?.settings.e_invoice_type === 'PEPPOL' &&
      company?.settings.enable_e_invoice &&
      company?.tax_data?.acts_as_sender &&
      triggerValidationQuery &&
      id === invoice?.id,
    onFinished: () => {
      setTriggerValidationQuery(false);
    },
  });

  const [client, setClient] = useState<Client | undefined>();

  const { calculateInvoiceSum } = useInvoiceUtilities({ client });

  const [errors, setErrors] = useState<ValidationBag>();
  const [saveChanges, setSaveChanges] = useState<boolean>(false);
  const [isDefaultTerms, setIsDefaultTerms] = useState<boolean>(false);
  const [isDefaultFooter, setIsDefaultFooter] = useState<boolean>(false);

  const save = useHandleSave({ setErrors, isDefaultTerms, isDefaultFooter });

  const tabs = useTabs({
    invoice,
    eInvoiceValidationResponse: validationResponse,
  });

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

  useEffect(() => {
    if (saveChanges && invoice) {
      save(invoice);
      setSaveChanges(false);
    }
  }, [saveChanges]);

  useSocketEvent<WithSocketId<InvoiceType>>({
    on: ['App\\Events\\Invoice\\InvoiceWasPaid'],
    callback: ({ data }) => {
      if (socketId()?.toString() !== data['x-socket-id']) {
        document
          .getElementById('invoiceUpdateBanner')
          ?.classList.remove('hidden');
      }
    },
  });

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
                onSaveClick={() => setSaveChanges(true)}
                disableSaveButton={
                  invoice &&
                  (invoice.status_id === InvoiceStatus.Cancelled ||
                    invoice.is_deleted)
                }
                disableSaveButtonOnly={invoice.is_locked}
                cypressRef="invoiceActionDropdown"
              />
            ),
          })}
        aboveMainContainer={
          <Banner id="invoiceUpdateBanner" className="hidden" variant="orange">
            {t('invoice_status_changed')}
          </Banner>
        }
        afterBreadcrumbs={<PreviousNextNavigation entity="invoice" />}
      >
        {invoice?.id === id ? (
          <div className="space-y-2">
            {Boolean(invoice?.is_locked) && (
              <div
                className="flex items-center justify-center h-10 w-full text-white"
                style={{ backgroundColor: '#4DA6FF' }}
              >
                {t('locked_invoice')}.
              </div>
            )}

            <div className="space-y-4">
              <Tabs
                tabs={tabs}
                rightSide={
                  invoice && (
                    <div className="flex items-center">
                      <CommonActions resource={invoice} entity="invoice" />
                    </div>
                  )
                }
              />

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
                  eInvoiceRef,
                  eInvoiceValidationEntityResponse: validationResponse,
                  setTriggerValidationQuery,
                }}
              />
            </div>
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
