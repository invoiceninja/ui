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
import { useTitle } from '$app/common/hooks/useTitle';
import { Client } from '$app/common/interfaces/client';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Page } from '$app/components/Breadcrumbs';
import { Default, SaveOption } from '$app/components/layouts/Default';
import { ResourceActions } from '$app/components/ResourceActions';
import { Spinner } from '$app/components/Spinner';
import { useAtom, useSetAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';
import { v4 } from 'uuid';

import { Icon } from '$app/components/icons/Icon';
import { MdNotStarted, MdSend } from 'react-icons/md';
import { RecurringInvoiceStatus } from '$app/common/enums/recurring-invoice-status';
import {
  ConfirmActionModal,
  confirmActionModalAtom,
} from './common/components/ConfirmActionModal';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useRecurringInvoiceQuery } from './common/queries';
import { recurringInvoiceAtom } from './common/atoms';
import {
  useActions,
  useRecurringInvoiceUtilities,
  useSave,
} from './common/hooks';
import { RecurringInvoice as RecurringInvoiceType } from '$app/common/interfaces/recurring-invoice';
import { Tabs } from '$app/components/Tabs';
import { useTabs } from './edit/hooks/useTabs';
import { CommonActions } from '../invoices/edit/components/CommonActions';
import { PreviousNextNavigation } from '$app/components/PreviousNextNavigation';

export default function RecurringInvoice() {
  const { documentTitle } = useTitle('edit_recurring_invoice');
  const [t] = useTranslation();

  const { id } = useParams();
  const actions = useActions();
  const { data } = useRecurringInvoiceQuery({ id: id! });

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const [saveOptions, setSaveOptions] = useState<SaveOption[]>();

  const pages: Page[] = [
    { name: t('recurring_invoices'), href: '/recurring_invoices' },
    {
      name: t('edit_recurring_invoice'),
      href: route('/recurring_invoices/:id/edit', { id }),
    },
  ];

  const setSendConfirmationVisible = useSetAtom(confirmActionModalAtom);
  const [recurringInvoice, setRecurringInvoice] = useAtom(recurringInvoiceAtom);

  const [client, setClient] = useState<Client>();
  const [errors, setErrors] = useState<ValidationBag>();

  const save = useSave({ setErrors });
  const tabs = useTabs({ recurringInvoice });

  const { calculateInvoiceSum } = useRecurringInvoiceUtilities({ client });

  useEffect(() => {
    if (data) {
      const ri = cloneDeep(data);

      ri.line_items.map((item) => (item._id = v4()));

      setRecurringInvoice(ri);

      if (ri && ri.client) {
        setClient(ri.client);
      }
    }
  }, [data]);

  const initializeSaveOptions = (recurringInvoice: RecurringInvoiceType) => {
    let currentSaveOptions: SaveOption[] | undefined;

    if (recurringInvoice?.status_id === RecurringInvoiceStatus.DRAFT) {
      const sendNowOption = {
        onClick: () => setSendConfirmationVisible(true),
        label: t('send_now'),
        icon: <Icon element={MdSend} />,
      };

      currentSaveOptions = [sendNowOption];
    }

    if (
      recurringInvoice.status_id === RecurringInvoiceStatus.DRAFT ||
      recurringInvoice.status_id === RecurringInvoiceStatus.PAUSED
    ) {
      const startOption = {
        onClick: () => save(recurringInvoice as RecurringInvoiceType, 'start'),
        label: t('start'),
        icon: <Icon element={MdNotStarted} />,
      };

      if (currentSaveOptions) {
        currentSaveOptions = [...currentSaveOptions, startOption];
      } else {
        currentSaveOptions = [startOption];
      }
    }

    setSaveOptions(currentSaveOptions);
  };

  useEffect(() => {
    recurringInvoice && calculateInvoiceSum(recurringInvoice);

    if (recurringInvoice) {
      initializeSaveOptions(recurringInvoice);
    }
  }, [recurringInvoice]);

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      {...((hasPermission('edit_recurring_invoice') ||
        entityAssigned(recurringInvoice)) &&
        recurringInvoice && {
        navigationTopRight: (
          <ResourceActions
            resource={recurringInvoice}
            onSaveClick={() => save(recurringInvoice)}
            // label={t('more_actions')}
            actions={actions}
            cypressRef="recurringInvoiceActionDropdown"
          />
        ),
      })}
      afterBreadcrumbs={<PreviousNextNavigation entity="recurring_invoice" />}
    >
      {recurringInvoice?.id === id ? (
        <div className="space-y-4">
          <Tabs
            tabs={tabs}
            rightSide={
              recurringInvoice && (
                <div className="flex items-center">
                  <CommonActions
                    resource={recurringInvoice}
                    entity="recurring_invoice"
                  />
                </div>
              )
            }
          />

          <Outlet
            context={{
              recurringInvoice,
              setRecurringInvoice,
              errors,
              client,
            }}
          />
        </div>
      ) : (
        <div className="flex justify-center items-center">
          <Spinner />
        </div>
      )}

      {recurringInvoice?.status_id === RecurringInvoiceStatus.DRAFT ? (
        <ConfirmActionModal
          onClick={() =>
            save(recurringInvoice as RecurringInvoiceType, 'send_now')
          }
        />
      ) : null}
    </Default>
  );
}
