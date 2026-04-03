/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import {
  DragDropContext,
  DropResult,
  Droppable,
  Draggable,
} from '@hello-pangea/dnd';
import { Record, clientMap } from '$app/common/constants/exports/client-map';
import { paymentMap } from '$app/common/constants/exports/payment-map';
import { quoteMap } from '$app/common/constants/exports/quote-map';
import { creditMap } from '$app/common/constants/exports/credit-map';
import { useTranslation } from 'react-i18next';
import { itemMap } from '$app/common/constants/exports/item-map';
import { vendorMap } from '$app/common/constants/exports/vendor-map';
import { purchaseorderMap } from '$app/common/constants/exports/purchase-order-map';
import { taskMap } from '$app/common/constants/exports/task-map';
import { expenseMap } from '$app/common/constants/exports/expense-map';
import { recurringinvoiceMap } from '$app/common/constants/exports/recurring-invoice-map';
import { usePreferences } from '$app/common/hooks/usePreferences';
import { Identifier } from '../useReports';
import { contactMap } from '$app/common/constants/exports/contact-map';
import { useColorScheme } from '$app/common/colors';
import { Entity } from '$app/common/hooks/useEntityCustomFields';
import { invoiceMap } from '$app/common/constants/exports/invoice-map';
import { useCurrentCompany } from '$app/common/hooks/useCurrentCompany';
import { customField } from '$app/components/CustomField';
import { DoubleChevronRight } from '$app/components/icons/DoubleChevronRight';
import { XMark } from '$app/components/icons/XMark';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const reportColumn = 11;

export function useTranslationAlias() {
  const [t] = useTranslation();
  const company = useCurrentCompany();
  const customFields = company?.custom_fields;

  const entityAlias = {
    credit: 'invoice',
    quote: 'invoice',
    recurring_invoice: 'invoice',
    purchase_order: 'invoice',
    recurring_expense: 'expense',
    item: 'product',
  };

  const findCustomField = (field: string, isVendorContactField?: boolean) => {
    const updatedField = field.includes('custom_value')
      ? field.replace('custom_value', 'custom')
      : field;

    return customFields[updatedField]
      ? customField(customFields[updatedField]).label()
      : `${
          isVendorContactField ? 'contact_custom_value' : 'custom'
        }${updatedField.charAt(updatedField.length - 1)}`;
  };

  return (field: string, entity: Entity) => {
    const updatedEntity =
      entityAlias[entity as keyof typeof entityAlias] || entity;

    const fields = {
      custom_value1: findCustomField(`${updatedEntity}1`),
      custom_value2: findCustomField(`${updatedEntity}2`),
      custom_value3: findCustomField(`${updatedEntity}3`),
      custom_value4: findCustomField(`${updatedEntity}4`),
      surcharge1: customFields.surcharge1,
      surcharge2: customFields.surcharge2,
      surcharge3: customFields.surcharge3,
      surcharge4: customFields.surcharge4,
      contact_custom_value1: findCustomField('vendor_contact1', true),
      contact_custom_value2: findCustomField('vendor_contact2', true),
      contact_custom_value3: findCustomField('vendor_contact3', true),
      contact_custom_value4: findCustomField('vendor_contact4', true),
    };

    return fields[field as keyof typeof fields] || t(field);
  };
}

interface ColumnProps {
  label: string;
  droppableId: string;
  isDropDisabled: boolean;
  data: Record[];
  onAddAll?: () => void;
  onReset?: () => void;
  onRemove?: (record: Record) => unknown;
}

export function Column({
  label,
  droppableId,
  isDropDisabled,
  data,
  onAddAll,
  onReset,
  onRemove,
}: ColumnProps) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const findTranslationAlias = useTranslationAlias();

  const translateLabel = (record: Record) => {
    const parts = record.value.split('.');

    return `${t(`${parts[0]}`)} - ${findTranslationAlias(
      record.trans,
      parts[0] as Entity
    )}`;
  };

  return (
    <div>
      <h2 className="font-medium" style={{ color: colors.$17 }}>
        {onReset ? (
          <div className="flex items-center justify-between">
            <span style={{ color: colors.$3 }}>{label}</span>

            <div
              className="flex items-center space-x-1 cursor-pointer"
              onClick={onReset}
            >
              <div>
                <XMark size="0.85rem" color={colors.$3} />
              </div>

              <span className="text-xs" style={{ color: colors.$3 }}>
                ({t('reset')})
              </span>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <span style={{ color: colors.$3 }}>{label}</span>

            {onAddAll && (
              <button type="button" onClick={onAddAll}>
                <DoubleChevronRight size="0.85rem" color={colors.$3} />
              </button>
            )}
          </div>
        )}
      </h2>

      <Droppable
        droppableId={droppableId}
        isDropDisabled={isDropDisabled}
        renderClone={(provided, _, rubric) => {
          const record = data[rubric.source.index];

          return (
            <div
              ref={provided.innerRef}
              {...provided.draggableProps}
              {...provided.dragHandleProps}
            >
              <div
                className="p-2 flex border justify-between items-center cursor-grab text-sm shadow-sm"
                style={{
                  color: colors.$3,
                  backgroundColor: colors.$1,
                  borderColor: colors.$24,
                }}
              >
                {translateLabel(record)}
              </div>
            </div>
          );
        }}
      >
        {(provided) => (
          <div
            className="w-80 flex-column"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <div
              className="overflow-y-scroll h-96 mt-2 border rounded-md"
              style={{
                borderColor: colors.$24,
              }}
            >
              {data &&
                data.map((record: Record, i: number) => (
                  <Draggable
                    key={record.value}
                    index={i}
                    draggableId={`left-word-${record.value}`}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <div
                          className="border-b p-2 flex justify-between items-center cursor-grab text-sm"
                          style={{
                            color: colors.$3,
                            borderColor: colors.$24,
                            backgroundColor: colors.$1,
                          }}
                        >
                          {translateLabel(record)}

                          {droppableId === reportColumn.toString() && (
                            <button
                              style={{
                                color: colors.$3,
                                colorScheme: colors.$0,
                                backgroundColor: colors.$1,
                                borderColor: colors.$4,
                              }}
                              type="button"
                              onClick={() =>
                                onRemove ? onRemove(record) : null
                              }
                            >
                              <XMark size="0.85rem" color={colors.$3} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
            </div>
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

interface Props {
  report: Identifier;
  columns: string[];
}

const positions = [
  'client',
  'invoice',
  'credit',
  'quote',
  'payment',
  'vendor',
  'purchase_order',
  'task',
  'expense',
  'recurring_invoice',
  'contact',
] as const;

export function useColumns({ report, columns }: Props) {
  const { preferences } = usePreferences();

  const defaultColumns = useMemo(
    () => [
      columns.includes('client') ? clientMap : [],
      columns.includes('invoice')
        ? columns.includes('item')
          ? invoiceMap.concat(itemMap.map((i) => ({ ...i, origin: 'invoice' })))
          : invoiceMap
        : [],
      columns.includes('credit')
        ? columns.includes('item')
          ? creditMap.concat(itemMap.map((i) => ({ ...i, origin: 'credit' })))
          : creditMap
        : [],
      columns.includes('quote')
        ? columns.includes('item')
          ? quoteMap.concat(itemMap.map((i) => ({ ...i, origin: 'quote' })))
          : quoteMap
        : [],
      columns.includes('payment') ? paymentMap : [],
      columns.includes('vendor') ? vendorMap : [],
      columns.includes('purchase_order')
        ? columns.includes('item')
          ? purchaseorderMap.concat(
              itemMap.map((i) => ({ ...i, origin: 'purchase_order' }))
            )
          : purchaseorderMap
        : [],
      columns.includes('task') ? taskMap : [],
      columns.includes('expense') ? expenseMap : [],
      columns.includes('recurring_invoice')
        ? columns.includes('item')
          ? recurringinvoiceMap.concat(
              itemMap.map((i) => ({ ...i, origin: 'recurring_invoice' }))
            )
          : recurringinvoiceMap
        : [],
      columns.includes('contact') ? contactMap : [],
      [],
    ],
    [columns]
  );

  const data =
    report in preferences.reports.columns &&
    preferences.reports.columns[report as Identifier].length !== 0
      ? preferences.reports.columns[report]
      : defaultColumns;

  return { data, defaultColumns };
}

export function SortableColumns({ report, columns }: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();

  const { update } = usePreferences();

  const { data: persistedData, defaultColumns } = useColumns({
    report,
    columns,
  });

  const [localData, setLocalData] = useState<Record[][]>(persistedData);

  useEffect(() => {
    setLocalData(persistedData);
  }, [report]);

  const syncToPreferences = useCallback(
    (newData: Record[][]) => {
      update(`preferences.reports.columns.${report}`, [...newData]);
    },
    [report, update]
  );

  const onDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) {
        return;
      }

      try {
        const sourceIndex = parseInt(result.source.droppableId);
        const destinationIndex = parseInt(result.destination!.droppableId);
        const destinationIndexPosition = result.destination!.index;

        setLocalData((current) => {
          const newData = current.map((arr, i) =>
            i === sourceIndex || i === destinationIndex ? [...arr] : arr
          );

          const word = newData[sourceIndex][result.source.index];
          newData[sourceIndex].splice(result.source.index, 1);
          newData[destinationIndex].splice(destinationIndexPosition, 0, word);

          syncToPreferences(newData);
          return newData;
        });
      } catch (e) {
        setLocalData(defaultColumns);
        syncToPreferences(defaultColumns);
      }
    },
    [defaultColumns, syncToPreferences]
  );

  const onRemove = useCallback(
    (record: Record) => {
      const index = positions.indexOf(record.map as (typeof positions)[number]);

      setLocalData((current) => {
        const newData = current.map((arr, i) =>
          i === reportColumn || i === index ? [...arr] : arr
        );

        newData[reportColumn] = newData[reportColumn].filter(
          (r) => r.value !== record.value
        );

        newData[index].push(record);

        syncToPreferences(newData);
        return newData;
      });
    },
    [syncToPreferences]
  );

  const onRemoveAll = useCallback(() => {
    setLocalData(defaultColumns);
    syncToPreferences(defaultColumns);
  }, [defaultColumns, syncToPreferences]);

  const handleAddAll = useCallback(
    (index: number) => {
      setLocalData((current) => {
        const newData = current.map((arr, i) =>
          i === reportColumn || i === index ? [...arr] : arr
        );
        newData[reportColumn] = [...newData[reportColumn], ...newData[index]];
        newData[index] = [];
        syncToPreferences(newData);
        return newData;
      });
    },
    [syncToPreferences]
  );

  const reportColumnsLabel = `${t('report')} ${t('columns')}`;

  return (
    <div
      className="overflow-x-auto border rounded-md w-full my-6 shadow-sm"
      style={{ borderColor: colors.$24 }}
    >
      <div
        style={{
          minWidth: 'min-content',
        }}
      >
        <div className="py-4" style={{ backgroundColor: colors.$1 }}>
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex w-full py-2 px-6 space-x-4">
              {columns.includes('client') && (
                <Column
                  label={t('client')}
                  onAddAll={() => handleAddAll(0)}
                  data={localData[0]}
                  droppableId="0"
                  isDropDisabled={true}
                />
              )}

              {columns.includes('invoice') && (
                <Column
                  label={t('invoice')}
                  onAddAll={() => handleAddAll(1)}
                  data={localData[1]}
                  droppableId="1"
                  isDropDisabled={true}
                />
              )}

              {columns.includes('credit') && (
                <Column
                  label={t('credit')}
                  onAddAll={() => handleAddAll(2)}
                  data={localData[2]}
                  droppableId="2"
                  isDropDisabled={true}
                />
              )}

              {columns.includes('quote') && (
                <Column
                  label={t('quote')}
                  onAddAll={() => handleAddAll(3)}
                  data={localData[3]}
                  droppableId="3"
                  isDropDisabled={true}
                />
              )}

              {columns.includes('payment') && (
                <Column
                  label={t('payment')}
                  onAddAll={() => handleAddAll(4)}
                  data={localData[4]}
                  droppableId="4"
                  isDropDisabled={true}
                />
              )}

              {columns.includes('vendor') && (
                <Column
                  label={t('vendor')}
                  onAddAll={() => handleAddAll(5)}
                  data={localData[5]}
                  droppableId="5"
                  isDropDisabled={true}
                />
              )}

              {columns.includes('purchase_order') && (
                <Column
                  label={t('purchase_order')}
                  onAddAll={() => handleAddAll(6)}
                  data={localData[6]}
                  droppableId="6"
                  isDropDisabled={true}
                />
              )}

              {columns.includes('task') && (
                <Column
                  label={t('task')}
                  onAddAll={() => handleAddAll(7)}
                  data={localData[7]}
                  droppableId="7"
                  isDropDisabled={true}
                />
              )}

              {columns.includes('expense') && (
                <Column
                  label={t('expense')}
                  onAddAll={() => handleAddAll(8)}
                  data={localData[8]}
                  droppableId="8"
                  isDropDisabled={true}
                />
              )}

              {columns.includes('recurring_invoice') && (
                <Column
                  label={t('recurring_invoice')}
                  onAddAll={() => handleAddAll(9)}
                  data={localData[9]}
                  droppableId="9"
                  isDropDisabled={true}
                />
              )}

              {columns.includes('contact') && (
                <Column
                  label={t('contact')}
                  onAddAll={() => handleAddAll(10)}
                  data={localData[10]}
                  droppableId="10"
                  isDropDisabled={true}
                />
              )}

              <Column
                label={reportColumnsLabel}
                onReset={onRemoveAll}
                data={localData[reportColumn]}
                droppableId={reportColumn.toString()}
                isDropDisabled={false}
                onRemove={onRemove}
              />
            </div>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
}
