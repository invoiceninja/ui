/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EntityState } from '$app/common/enums/entity-state';
import { Guard } from '$app/common/guards/Guard';
import { or } from '$app/common/guards/guards/or';
import { permission } from '$app/common/guards/guards/permission';
import { getEntityState } from '$app/common/helpers';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { $refetch } from '$app/common/hooks/useRefetch';
import { useTitle } from '$app/common/hooks/useTitle';
import { Payment } from '$app/common/interfaces/payment';
import { usePaymentQuery } from '$app/common/queries/payments';
import { useSocketEvent } from '$app/common/queries/sockets';
import { Page } from '$app/components/Breadcrumbs';
import { DataTable } from '$app/components/DataTable';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { InputLabel } from '$app/components/forms';
import { ImportButton } from '$app/components/import/ImportButton';
import { Default } from '$app/components/layouts/Default';
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import {
  PaymentSlider,
  paymentSliderAtom,
  paymentSliderVisibilityAtom,
} from '../common/components/PaymentSlider';
import { useActions } from '../common/hooks/useActions';
import { useCustomBulkActions } from '../common/hooks/useCustomBulkActions';
import {
  defaultColumns,
  useAllPaymentColumns,
  usePaymentColumns,
} from '../common/hooks/usePaymentColumns';
import { usePaymentFilters } from '../common/hooks/usePaymentFilters';

export default function Payments() {
  useTitle('payments');

  const [t] = useTranslation();

  const hasPermission = useHasPermission();
  const disableNavigation = useDisableNavigation();

  const actions = useActions();
  const filters = usePaymentFilters();
  const columns = usePaymentColumns();
  const paymentColumns = useAllPaymentColumns();
  const customBulkActions = useCustomBulkActions();

  const pages: Page[] = [{ name: t('payments'), href: '/payments' }];

  const [sliderPaymentId, setSliderPaymentId] = useState<string>('');
  const [paymentSlider, setPaymentSlider] = useAtom(paymentSliderAtom);
  const [paymentSliderVisibility, setPaymentSliderVisibility] = useAtom(
    paymentSliderVisibilityAtom
  );

  const { data: paymentResponse } = usePaymentQuery({
    id: sliderPaymentId,
    include: 'credits',
  });

  useEffect(() => {
    if (paymentResponse && paymentSliderVisibility) {
      setPaymentSlider(paymentResponse);
    }
  }, [paymentResponse, paymentSliderVisibility]);

  useEffect(() => {
    return () => setPaymentSliderVisibility(false);
  }, []);

  const {
    changeTemplateVisible,
    setChangeTemplateVisible,
    changeTemplateResources,
  } = useChangeTemplate();

  useSocketEvent({
    on: 'App\\Events\\Payment\\PaymentWasUpdated',
    callback: () => $refetch(['payments']),
  });

  return (
    <Default title={t('payments')} breadcrumbs={pages} docsLink="en/payments/">
      <DataTable
        resource="payment"
        columns={columns}
        endpoint="/api/v1/payments?include=client,invoices&without_deleted_clients=true&sort=id|desc"
        linkToCreate="/payments/create"
        bulkRoute="/api/v1/payments/bulk"
        linkToEdit="/payments/:id/edit"
        withResourcefulActions
        customActions={actions}
        customFilters={filters}
        customBulkActions={customBulkActions}
        customFilterPlaceholder="status"
        showRestore={(resource: Payment) => !resource.is_deleted}
        rightSide={
          <div className="flex items-center space-x-2">
            <DataTableColumnsPicker
              columns={paymentColumns as unknown as string[]}
              defaultColumns={defaultColumns}
              table="payment"
            />

            <Guard
              type="component"
              component={<ImportButton route="/payments/import" />}
              guards={[
                or(permission('create_payment'), permission('edit_payment')),
              ]}
            />
          </div>
        }
        onTableRowClick={(payment) => {
          setSliderPaymentId(payment.id);
          setPaymentSliderVisibility(true);
        }}
        linkToCreateGuards={[permission('create_payment')]}
        hideEditableOptions={!hasPermission('edit_payment')}
        showRestoreBulk={(selectedPayments) =>
          selectedPayments.every(
            (payment) => getEntityState(payment) === EntityState.Archived
          )
        }
        enableSavingFilterPreference
        dateRangeColumns={[
          {
            column: 'date',
            queryParameterKey: 'date_range',
            includeColumnNameInQuery: true,
          },
          {
            column: 'created_at',
            queryParameterKey: 'created_between',
          },
        ]}
        enableSavingLatestDataForNavigation
      />

      {!disableNavigation('payment', paymentSlider) && <PaymentSlider />}

      <ChangeTemplateModal<Payment>
        entity="payment"
        entities={changeTemplateResources as Payment[]}
        visible={changeTemplateVisible}
        setVisible={setChangeTemplateVisible}
        labelFn={(payment) => (
          <div className="flex flex-col space-y-1">
            <InputLabel>{t('number')}</InputLabel>

            <span>{payment.number}</span>
          </div>
        )}
        bulkLabelFn={(payment) => (
          <div className="flex space-x-2">
            <InputLabel>{t('number')}:</InputLabel>

            <span>{payment.number}</span>
          </div>
        )}
        bulkUrl="/api/v1/payments/bulk"
      />
    </Default>
  );
}
