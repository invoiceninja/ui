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
import { useReactSettings } from '$app/common/hooks/useReactSettings';
import { useTitle } from '$app/common/hooks/useTitle';
import { Client } from '$app/common/interfaces/client';
import { InvoiceItemType } from '$app/common/interfaces/invoice-item';
import { ValidationBag } from '$app/common/interfaces/validation-bag';
import { Page } from '$app/components/Breadcrumbs';
import { Default, SaveOption } from '$app/components/layouts/Default';
import { ResourceActions } from '$app/components/ResourceActions';
import { Spinner } from '$app/components/Spinner';
import { useAtom } from 'jotai';
import { cloneDeep } from 'lodash';
import { ClientSelector } from '$app/pages/invoices/common/components/ClientSelector';
import { InvoicePreview } from '$app/pages/invoices/common/components/InvoicePreview';
import { InvoiceTotals } from '$app/pages/invoices/common/components/InvoiceTotals';
import { ProductsTable } from '$app/pages/invoices/common/components/ProductsTable';
import { useProductColumns } from '$app/pages/invoices/common/hooks/useProductColumns';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useSearchParams } from 'react-router-dom';
import { v4 } from 'uuid';
import { invoiceSumAtom, recurringInvoiceAtom } from '../common/atoms';
import { InvoiceDetails } from '../common/components/InvoiceDetails';
import { InvoiceFooter } from '../common/components/InvoiceFooter';
import {
  useActions,
  useRecurringInvoiceUtilities,
  useSave,
} from '../common/hooks';
import { useRecurringInvoiceQuery } from '../common/queries';
import { Icon } from '$app/components/icons/Icon';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { MdNotStarted, MdSend } from 'react-icons/md';
import { RecurringInvoiceStatus } from '$app/common/enums/recurring-invoice-status';
import { Card } from '$app/components/cards';
import { RecurringInvoiceStatus as RecurringInvoiceStatusBadge } from '../common/components/RecurringInvoiceStatus';
import { TabGroup } from '$app/components/TabGroup';
import { useTaskColumns } from '$app/pages/invoices/common/hooks/useTaskColumns';
import {
  ConfirmActionModal,
  confirmActionModalAtom,
} from '../common/components/ConfirmActionModal';
import { useHasPermission } from '$app/common/hooks/permissions/useHasPermission';
import { useEntityAssigned } from '$app/common/hooks/useEntityAssigned';
import { useColorScheme } from '$app/common/colors';

export default function Edit() {
  const { t } = useTranslation();
  const { id } = useParams();
  const { documentTitle } = useTitle('edit_recurring_invoice');
  const { data } = useRecurringInvoiceQuery({ id: id! });

  const reactSettings = useReactSettings();

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

  const [recurringInvoice, setRecurringInvoice] = useAtom(recurringInvoiceAtom);
  const [invoiceSum] = useAtom(invoiceSumAtom);

  const [client, setClient] = useState<Client>();
  const [errors, setErrors] = useState<ValidationBag>();

  const {
    handleChange,
    handleInvitationChange,
    handleLineItemChange,
    handleLineItemPropertyChange,
    handleCreateLineItem,
    handleDeleteLineItem,
    calculateInvoiceSum,
  } = useRecurringInvoiceUtilities({ client });

  const productColumns = useProductColumns();

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

  const actions = useActions();
  const save = useSave({ setErrors });

  const [, setSendConfirmationVisible] = useAtom(confirmActionModalAtom);

  const initializeSaveOptions = (recurringInvoice: RecurringInvoice) => {
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
        onClick: () => save(recurringInvoice as RecurringInvoice, 'start'),
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

  const [searchParams] = useSearchParams();
  const taskColumns = useTaskColumns();
  const colors = useColorScheme();

  return (
    <Default
      title={documentTitle}
      breadcrumbs={pages}
      {...((hasPermission('edit_recurring_invoice') ||
        entityAssigned(recurringInvoice)) &&
        recurringInvoice && {
          onSaveClick: () => save(recurringInvoice),
          navigationTopRight: (
            <ResourceActions
              resource={recurringInvoice}
              label={t('more_actions')}
              actions={actions}
              cypressRef="recurringInvoiceActionDropdown"
            />
          ),
          additionalSaveOptions: saveOptions,
        })}
    >
      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-12 xl:col-span-4 h-max" withContainer>
          {recurringInvoice && (
            <div className="flex space-x-20">
              <span
                className="text-sm"
                style={{
                  backgroundColor: colors.$2,
                  color: colors.$3,
                  colorScheme: colors.$0,
                }}
              >
                {t('status')}
              </span>
              <RecurringInvoiceStatusBadge entity={recurringInvoice} />
            </div>
          )}

          <ClientSelector
            resource={recurringInvoice}
            onChange={(id) => handleChange('client_id', id)}
            onClearButtonClick={() => handleChange('client_id', '')}
            onContactCheckboxChange={handleInvitationChange}
            errorMessage={errors?.errors.client_id}
            textOnly
            readonly
          />
        </Card>

        <InvoiceDetails handleChange={handleChange} errors={errors} />

        <div className="col-span-12">
          <TabGroup
            tabs={[t('products'), t('tasks')]}
            defaultTabIndex={searchParams.get('table') === 'tasks' ? 1 : 0}
          >
            <div>
              {recurringInvoice && client ? (
                <ProductsTable
                  type="product"
                  resource={recurringInvoice}
                  items={recurringInvoice.line_items.filter((item) =>
                    [
                      InvoiceItemType.Product,
                      InvoiceItemType.UnpaidFee,
                      InvoiceItemType.PaidFee,
                      InvoiceItemType.LateFee,
                    ].includes(item.type_id)
                  )}
                  columns={productColumns}
                  relationType="client_id"
                  onLineItemChange={handleLineItemChange}
                  onSort={(lineItems) => handleChange('line_items', lineItems)}
                  onLineItemPropertyChange={handleLineItemPropertyChange}
                  onCreateItemClick={() =>
                    handleCreateLineItem(InvoiceItemType.Product)
                  }
                  onDeleteRowClick={handleDeleteLineItem}
                />
              ) : (
                <Spinner />
              )}
            </div>

            <div>
              {recurringInvoice && client ? (
                <ProductsTable
                  type="task"
                  resource={recurringInvoice}
                  items={recurringInvoice.line_items.filter(
                    (item) => item.type_id === InvoiceItemType.Task
                  )}
                  columns={taskColumns}
                  relationType="client_id"
                  onLineItemChange={handleLineItemChange}
                  onSort={(lineItems) => handleChange('line_items', lineItems)}
                  onLineItemPropertyChange={handleLineItemPropertyChange}
                  onCreateItemClick={() =>
                    handleCreateLineItem(InvoiceItemType.Task)
                  }
                  onDeleteRowClick={handleDeleteLineItem}
                />
              ) : (
                <Spinner />
              )}
            </div>
          </TabGroup>
        </div>

        <InvoiceFooter handleChange={handleChange} errors={errors} />

        {recurringInvoice && (
          <InvoiceTotals
            relationType="client_id"
            resource={recurringInvoice}
            invoiceSum={invoiceSum}
            onChange={(property, value) =>
              handleChange(property, value as string)
            }
          />
        )}
      </div>

      {reactSettings?.show_pdf_preview && (
        <div className="my-4">
          {recurringInvoice && (
            <InvoicePreview
              for="invoice"
              resource={recurringInvoice}
              entity="recurring_invoice"
              relationType="client_id"
              endpoint="/api/v1/live_preview?entity=:entity"
              withRemoveLogoCTA
            />
          )}
        </div>
      )}

      {recurringInvoice?.status_id === RecurringInvoiceStatus.DRAFT ? (
        <ConfirmActionModal
          onClick={() => save(recurringInvoice as RecurringInvoice, 'send_now')}
        />
      ) : null}
    </Default>
  );
}
