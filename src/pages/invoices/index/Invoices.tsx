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
import { DataTable } from '$app/components/DataTable';
import { Default } from '$app/components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { useActions } from '../edit/components/Actions';
import {
  defaultColumns,
  useAllInvoiceColumns,
  useInvoiceColumns,
} from '../common/hooks/useInvoiceColumns';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { useInvoiceFilters } from '../common/hooks/useInvoiceFilters';
import { ImportButton } from '$app/components/import/ImportButton';
import { Guard } from '$app/common/guards/Guard';
import { permission } from '$app/common/guards/guards/permission';
import { or } from '$app/common/guards/guards/or';
import { useCustomBulkActions } from '../common/hooks/useCustomBulkActions';
import {
  InvoiceSlider,
  invoiceSliderAtom,
  invoiceSliderVisibilityAtom,
} from '../common/components/InvoiceSlider';
import { useAtom, useSetAtom } from 'jotai';
import { useInvoiceQuery } from '$app/common/queries/invoices';
import { useEffect, useState } from 'react';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { useDateRangeColumns } from '../common/hooks/useDateRangeColumns';
import {
  ChangeTemplateModal,
  useChangeTemplate,
} from '$app/pages/settings/invoice-design/pages/custom-designs/components/ChangeTemplate';
import { Invoice } from '$app/common/interfaces/invoice';
import { useFooterColumns } from '../common/hooks/useFooterColumns';
import { DataTableFooterColumnsPicker } from '$app/components/DataTableFooterColumnsPicker';
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useSocketEvent } from '$app/common/queries/sockets';
import { $refetch } from '$app/common/hooks/useRefetch';
import { InputLabel } from '$app/components/forms';
import { useBulk } from '$app/common/queries/invoices';
import {
  ConfirmActionModal,
  confirmActionModalAtom,
} from '$app/pages/recurring-invoices/common/components/ConfirmActionModal';

export default function Invoices() {
  const { documentTitle } = useTitle('invoices');

  const [t] = useTranslation();

  const pages = [{ name: t('invoices'), href: '/invoices' }];

  const hasPermission = useHasPermission();
  const disableNavigation = useDisableNavigation();

  const deselectAll = () => {
    setSelectedInvoiceIds([]);
  };

  const [sliderInvoiceId, setSliderInvoiceId] = useState<string>('');
  const [invoiceSlider, setInvoiceSlider] = useAtom(invoiceSliderAtom);
  const setIsConfirmActionModalOpen = useSetAtom(confirmActionModalAtom);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<string[]>([]);
  const [invoiceSliderVisibility, setInvoiceSliderVisibility] = useAtom(
    invoiceSliderVisibilityAtom
  );

  const { data: invoiceResponse } = useInvoiceQuery({ id: sliderInvoiceId });

  const actions = useActions();
  const bulk = useBulk({
    onSuccess: deselectAll,
  });

  const filters = useInvoiceFilters();
  const columns = useInvoiceColumns();
  const reactSettings = useReactSettings();
  const invoiceColumns = useAllInvoiceColumns();
  const dateRangeColumns = useDateRangeColumns();
  const customBulkActions = useCustomBulkActions();
  const { footerColumns, allFooterColumns } = useFooterColumns();

  useEffect(() => {
    if (invoiceResponse && invoiceSliderVisibility) {
      setInvoiceSlider(invoiceResponse);
    }
  }, [invoiceResponse, invoiceSliderVisibility]);

  useEffect(() => {
    return () => setInvoiceSliderVisibility(false);
  }, []);

  const {
    changeTemplateVisible,
    setChangeTemplateVisible,
    changeTemplateResources,
  } = useChangeTemplate();

  useSocketEvent({
    on: [
      'App\\Events\\Invoice\\InvoiceWasPaid',
      'App\\Events\\Invoice\\InvoiceWasViewed',
    ],
    callback: () => $refetch(['invoices']),
  });

  return (
    <Default title={documentTitle} breadcrumbs={pages} docsLink="en/invoices">
      <DataTable
        resource="invoice"
        endpoint="/api/v1/invoices?include=client.group_settings&without_deleted_clients=true&sort=id|desc"
        columns={columns}
        footerColumns={footerColumns}
        bulkRoute="/api/v1/invoices/bulk"
        linkToCreate="/invoices/create"
        linkToEdit="/invoices/:id/edit"
        withResourcefulActions
        customActions={actions}
        bottomActionsKeys={['cancel_invoice']}
        customBulkActions={customBulkActions}
        customFilters={filters}
        customFilterPlaceholder="status"
        rightSide={
          <div className="flex items-center space-x-2">
            {Boolean(reactSettings.show_table_footer) && (
              <DataTableFooterColumnsPicker
                table="invoice"
                columns={allFooterColumns}
              />
            )}

            <DataTableColumnsPicker
              table="invoice"
              columns={invoiceColumns as unknown as string[]}
              defaultColumns={defaultColumns}
            />

            <Guard
              type="component"
              component={<ImportButton route="/invoices/import" />}
              guards={[
                or(permission('create_invoice'), permission('edit_invoice')),
              ]}
            />
          </div>
        }
        linkToCreateGuards={[permission('create_invoice')]}
        hideEditableOptions={!hasPermission('edit_invoice')}
        onTableRowClick={(invoice) => {
          setSliderInvoiceId(invoice.id);
          setInvoiceSliderVisibility(true);
        }}
        dateRangeColumns={dateRangeColumns}
        enableSavingFilterPreference
        onDeleteBulkAction={(selected) => {
          setSelectedInvoiceIds(selected);
          setIsConfirmActionModalOpen(true);
        }}
      />

      {!disableNavigation('invoice', invoiceSlider) && <InvoiceSlider />}

      <ChangeTemplateModal<Invoice>
        entity="invoice"
        entities={changeTemplateResources as Invoice[]}
        visible={changeTemplateVisible}
        setVisible={setChangeTemplateVisible}
        labelFn={(invoice) => (
          <div className="flex flex-col space-y-1">
            <InputLabel>{t('number')}</InputLabel>

            <span>{invoice.number}</span>
          </div>
        )}
        bulkLabelFn={(invoice) => (
          <div className="flex space-x-2">
            <InputLabel>{t('number')}:</InputLabel>

            <span>{invoice.number}</span>
          </div>
        )}
        bulkUrl="/api/v1/invoices/bulk"
      />

      <ConfirmActionModal
        title={t('delete_invoices')}
        message={t('delete_invoices_confirmation')}
        disabledButton={selectedInvoiceIds.length === 0}
        onClick={() => {
          bulk(selectedInvoiceIds, 'delete');
        }}
      />
    </Default>
  );
}
