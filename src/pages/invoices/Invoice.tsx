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
import {
  Outlet,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
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
import { useSocketEvent } from '$app/common/queries/sockets';
import toast from 'react-hot-toast';
import { Modal } from '$app/components/Modal';
import { Button } from '$app/components/forms';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export default function Invoice() {
  const { documentTitle } = useTitle('edit_invoice');

  const [t] = useTranslation();

  const { id } = useParams();
  const [searchParams] = useSearchParams();

  const currentCompany = useCurrentCompany();

  const navigate = useNavigate();
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
  const [isLockedInvoiceModalOpen, setIsLockedInvoiceModalOpen] =
    useState<boolean>(false);

  const save = useHandleSave({ setErrors, isDefaultTerms, isDefaultFooter });

  const tabs = useTabs({ invoice });

  const pages: Page[] = [
    { name: t('invoices'), href: '/invoices' },
    { name: t('edit_invoice'), href: route('/invoices/:id/edit', { id }) },
  ];

  const isInvoiceLocked = () => {
    if (currentCompany?.settings.lock_invoices === 'when_sent') {
      return invoice?.status_id === InvoiceStatus.Sent;
    }

    if (currentCompany?.settings.lock_invoices === 'when_paid') {
      return invoice?.status_id === InvoiceStatus.Paid;
    }

    if (invoice && currentCompany?.settings.lock_invoices === 'end_of_month') {
      const createdAtDateYear = dayjs.unix(invoice.created_at).year();
      const createdAtDateMonth = dayjs.unix(invoice.created_at).month();

      const currentDateYear = dayjs().utc().year();
      const currentDateMonth = dayjs().utc().month();

      return (
        currentDateYear > createdAtDateYear ||
        currentDateMonth > createdAtDateMonth
      );
    }

    return false;
  };

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
    if (invoice && invoice.id === id && isInvoiceLocked()) {
      setIsLockedInvoiceModalOpen(true);
    }
  }, [invoice]);

  useSocketEvent({
    on: ['App\\Events\\Invoice\\InvoiceWasPaid'],
    callback: () => toast(t('invoice_status_changed'), { duration: 5000 }),
  });

  return (
    <>
      <Modal
        visible={isLockedInvoiceModalOpen}
        onClose={() => setIsLockedInvoiceModalOpen(false)}
        disableClosing
      >
        <div className="flex flex-col space-y-6">
          {currentCompany?.settings.lock_invoices === 'when_sent' && (
            <span className="font-medium text-lg text-center">
              {t('sent_invoices_are_locked')}.
            </span>
          )}

          {currentCompany?.settings.lock_invoices === 'when_paid' && (
            <span className="font-medium text-lg text-center">
              {t('paid_invoices_are_locked')}.
            </span>
          )}

          {currentCompany?.settings.lock_invoices === 'end_of_month' && (
            <span className="font-medium text-lg text-center">
              {t('invoices_locked_end_of_month')}.
            </span>
          )}

          <Button behavior="button" onClick={() => navigate('/invoices')}>
            {t('dismiss')}
          </Button>
        </div>
      </Modal>

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
