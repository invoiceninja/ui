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
import { Default } from '$app/components/layouts/Default';
import { ResourceActions } from '$app/components/ResourceActions';
import { Spinner } from '$app/components/Spinner';
import { useAtom, useAtomValue } from 'jotai';
import { cloneDeep } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useParams } from 'react-router-dom';
import { v4 } from 'uuid';

import { RecurringInvoiceStatus } from '$app/common/enums/recurring-invoice-status';
import { ConfirmActionModal } from './common/components/ConfirmActionModal';
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
import { Banner } from '$app/components/Banner';
import { refreshEntityDataBannerAtom } from '$app/App';

export default function RecurringInvoice() {
  const { documentTitle } = useTitle('edit_recurring_invoice');
  const [t] = useTranslation();

  const { id } = useParams();
  const actions = useActions();

  const { data } = useRecurringInvoiceQuery({ id: id! });

  const hasPermission = useHasPermission();
  const entityAssigned = useEntityAssigned();

  const pages: Page[] = [
    { name: t('recurring_invoices'), href: '/recurring_invoices' },
    {
      name: t('edit_recurring_invoice'),
      href: route('/recurring_invoices/:id/edit', { id }),
    },
  ];

  const [recurringInvoice, setRecurringInvoice] = useAtom(recurringInvoiceAtom);
  const {
    visible: refetchBannerVisible,
    refetchEntityId,
    refetchEntity,
  } = useAtomValue(refreshEntityDataBannerAtom);

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

  useEffect(() => {
    recurringInvoice && calculateInvoiceSum(recurringInvoice);
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
      aboveMainContainer={
        Boolean(
          refetchBannerVisible &&
            refetchEntityId === id &&
            refetchEntity === 'recurring_invoices'
        ) && <Banner variant="orange">{t('invoice_status_changed')}</Banner>
      }
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
