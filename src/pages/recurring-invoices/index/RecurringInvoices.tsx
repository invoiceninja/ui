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
import { ImportButton } from '$app/components/import/ImportButton';

import {
  defaultColumns,
  useActions,
  useAllRecurringInvoiceColumns,
  useRecurringInvoiceColumns,
  useRecurringInvoiceFilters,
} from '../common/hooks';
import { DataTableColumnsPicker } from '$app/components/DataTableColumnsPicker';
import { Guard } from '$app/common/guards/Guard';
import { or } from '$app/common/guards/guards/or';
import { permission } from '$app/common/guards/guards/permission';
import { useAtom } from 'jotai';
import {
  RecurringInvoiceSlider,
  recurringInvoiceSliderAtom,
  recurringInvoiceSliderVisibilityAtom,
} from '../common/components/RecurringInvoiceSlider';
import { useEffect, useState } from 'react';
import { useRecurringInvoiceQuery } from '../common/queries';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { useCustomBulkActions } from '../common/hooks/useCustomBulkActions';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useDisableNavigation } from '$app/common/hooks/useDisableNavigation';
import { useFooterColumns } from '../common/hooks/useFooterColumns';
import { DataTableFooterColumnsPicker } from '$app/components/DataTableFooterColumnsPicker';
import classNames from 'classnames';
import { useReactSettings } from '$app/common/hooks/useReactSettings';

export default function RecurringInvoices() {
  useTitle('recurring_invoices');

  const [t] = useTranslation();

  const hasPermission = useHasPermission();
  const disableNavigation = useDisableNavigation();

  const [sliderRecurringInvoiceId, setSliderRecurringInvoiceId] =
    useState<string>('');

  const { data: recurringInvoiceResponse } = useRecurringInvoiceQuery({
    id: sliderRecurringInvoiceId,
  });

  const pages: Page[] = [
    { name: t('recurring_invoices'), href: '/recurring_invoices' },
  ];

  const actions = useActions();
  const reactSettings = useReactSettings();
  const filters = useRecurringInvoiceFilters();
  const columns = useRecurringInvoiceColumns();
  const customBulkActions = useCustomBulkActions();
  const { footerColumns, allFooterColumns } = useFooterColumns();
  const recurringInvoiceColumns = useAllRecurringInvoiceColumns();

  const [recurringInvoiceSlider, setRecurringInvoiceSlider] = useAtom(
    recurringInvoiceSliderAtom
  );
  const [
    recurringInvoiceSliderVisibility,
    setRecurringInvoiceSliderVisibility,
  ] = useAtom(recurringInvoiceSliderVisibilityAtom);

  useEffect(() => {
    if (recurringInvoiceResponse && recurringInvoiceSliderVisibility) {
      setRecurringInvoiceSlider(recurringInvoiceResponse);
    }
  }, [recurringInvoiceResponse, recurringInvoiceSliderVisibility]);

  useEffect(() => {
    return () => setRecurringInvoiceSliderVisibility(false);
  }, []);

  return (
    <Default
      title={t('recurring_invoices')}
      breadcrumbs={pages}
      docsLink="en/recurring-invoices/"
      withoutBackButton
    >
      <DataTable
        resource="recurring_invoice"
        columns={columns}
        footerColumns={footerColumns}
        endpoint="/api/v1/recurring_invoices?include=client&without_deleted_clients=true&sort=id|desc"
        linkToCreate="/recurring_invoices/create"
        linkToEdit="/recurring_invoices/:id/edit"
        bulkRoute="/api/v1/recurring_invoices/bulk"
        customActions={actions}
        customFilters={filters}
        customBulkActions={customBulkActions}
        customFilterPlaceholder="status"
        withResourcefulActions
        rightSide={
          <Guard
            type="component"
            guards={[
              or(
                permission('create_recurring_invoice'),
                permission('edit_recurring_invoice')
              ),
            ]}
            component={<ImportButton route="/recurring_invoices/import" />}
          />
        }
        leftSideChevrons={
          <div
            className={classNames('flex items-center space-x-1', {
              'pr-4': Boolean(reactSettings.show_table_footer),
            })}
          >
            {Boolean(reactSettings.show_table_footer) && (
              <>
                <DataTableFooterColumnsPicker
                  table="recurringInvoice"
                  columns={allFooterColumns}
                />

                <span>|</span>
              </>
            )}

            <DataTableColumnsPicker
              columns={recurringInvoiceColumns as unknown as string[]}
              defaultColumns={defaultColumns}
              table="recurringInvoice"
            />
          </div>
        }
        linkToCreateGuards={[permission('create_recurring_invoice')]}
        hideEditableOptions={!hasPermission('edit_recurring_invoice')}
        onTableRowClick={(recurringInvoice) => {
          setSliderRecurringInvoiceId(
            (recurringInvoice as RecurringInvoice).id
          );
          setRecurringInvoiceSliderVisibility(true);
        }}
      />

      {!disableNavigation('recurring_invoice', recurringInvoiceSlider) && (
        <RecurringInvoiceSlider />
      )}
    </Default>
  );
}
