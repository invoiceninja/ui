/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from '$app/common/hooks/useTitle';
import { Page } from '$app/components/Breadcrumbs';
import { DataTable } from '$app/components/DataTable';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import {
  defaultColumns,
  useAllPaymentColumns,
  usePaymentColumns,
} from '../common/hooks/usePaymentColumns';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { useActions } from '../common/hooks/useActions';
import { usePaymentFilters } from '../common/hooks/usePaymentFilters';
import { Payment } from '$app/common/interfaces/payment';
import { permission } from '$app/common/guards/guards/permission';
import { useCustomBulkActions } from '../common/hooks/useCustomBulkActions';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { usePaymentQuery } from '$app/common/queries/payments';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import {
  PaymentSlider,
  paymentSliderAtom,
  paymentSliderVisibilityAtom,
} from '../common/components/PaymentSlider';
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';

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

  return (
    <Default
      title={t('payments')}
      breadcrumbs={pages}
      docsLink="en/payments/"
      withoutBackButton
    >
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
        leftSideChevrons={
          <DataTableColumnsPicker
            columns={paymentColumns as unknown as string[]}
            defaultColumns={defaultColumns}
            table="payment"
          />
        }
        onTableRowClick={(payment) => {
          setSliderPaymentId(payment.id);
          setPaymentSliderVisibility(true);
        }}
        linkToCreateGuards={[permission('create_payment')]}
        hideEditableOptions={!hasPermission('edit_payment')}
      />

      {!disableNavigation('payment', paymentSlider) && <PaymentSlider />}

      <ChangeTemplateModal<Payment>
        entity="payment"
        entities={changeTemplateResources as Payment[]}
        visible={changeTemplateVisible}
        setVisible={setChangeTemplateVisible}
        labelFn={(payment) => `${t('number')}: ${payment.number}`}
        bulkUrl="/api/v1/payments/bulk"
      />
    </Default>
  );
}
