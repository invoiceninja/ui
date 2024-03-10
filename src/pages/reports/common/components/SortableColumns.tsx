/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card } from '$app/components/cards';
import {
  DragDropContext,
  DropResult,
  Droppable,
  Draggable,
} from '@hello-pangea/dnd';
import { cloneDeep } from 'lodash';
import { Record, clientMap } from '$app/common/constants/exports/client-map';
import { paymentMap } from '$app/common/constants/exports/payment-map';
import { t } from 'i18next';
import { quoteMap } from '$app/common/constants/exports/quote-map';
import { creditMap } from '$app/common/constants/exports/credit-map';
import { useTranslation } from 'react-i18next';
import { ChevronsRight, X } from 'react-feather';
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
  title: string | (() => JSX.Element);
  droppableId: string;
  isDropDisabled: boolean;
  data: Record[];
  onRemove?: (record: Record) => unknown;
}

export function Column({
  title,
  droppableId,
  isDropDisabled,
  data,
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
      <h2 className="text-gray-500 font-medium">
        {typeof title === 'string' ? <p>{title}</p> : title()}
      </h2>

      <Droppable droppableId={droppableId} isDropDisabled={isDropDisabled}>
        {(provided) => (
          <div
            style={{
              color: colors.$3,
              colorScheme: colors.$0,
              backgroundColor: colors.$1,
              borderColor: colors.$4,
            }}
            className="w-80 flex-column"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            <div className="overflow-y-scroll h-96 mt-2 border rounded-md divide-y">
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
                        <span
                          style={{
                            color: colors.$3,
                            colorScheme: colors.$0,
                            backgroundColor: colors.$1,
                            borderColor: colors.$4,
                          }}
                          className="p-2 flex justify-between items-center cursor-move ml-2 text-sm"
                          key={i}
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
                              <X size={15} />
                            </button>
                          )}
                        </span>
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

  const defaultColumns = [
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
  ];

  const data =
    report in preferences.reports.columns &&
    preferences.reports.columns[report as Identifier].length !== 0
      ? preferences.reports.columns[report]
      : defaultColumns;

  return { data, defaultColumns };
}

export function SortableColumns({ report, columns }: Props) {
  const { update } = usePreferences();
  const { data, defaultColumns } = useColumns({ report, columns });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    try {
      // Create a copy of the data array
      const $data = cloneDeep(data);

      // Find a source index
      const sourceIndex = parseInt(result.source.droppableId);

      // Find a string
      const word = $data[sourceIndex][result.source.index];

      // Cut a word from the original array
      $data[sourceIndex].splice(result.source.index, 1);

      // Find a destination index
      const destinationIndex = parseInt(result.destination.droppableId);

      // Then we can insert the word into new array at specific index
      $data[destinationIndex].splice(result.destination.index, 0, word);

      update(`preferences.reports.columns.${report}`, [...$data]);
    } catch (e) {
      // In case we hit any error, due to wrong data or something similar, we should just reset the state.

      update(`preferences.reports.columns.${report}`, defaultColumns);
    }
  };

  const onRemove = (record: Record) => {
    const index = positions.indexOf(record.map as (typeof positions)[number]);

    // Remove it from the reports
    const $data = cloneDeep(data);

    $data[reportColumn] = $data[reportColumn].filter(
      (r) => r.value !== record.value
    );

    // Add it back to the original
    $data[index].push(record);

    update(`preferences.reports.columns.${report}`, [...$data]);
  };

  const onRemoveAll = () => {
    update(`preferences.reports.columns.${report}`, defaultColumns);
  };

  const onAddAll = (index: number) => {
    const $data = cloneDeep(data);

    $data[reportColumn] = [...$data[reportColumn], ...$data[index]];

    $data[index] = [];

    update(`preferences.reports.columns.${report}`, [...$data]);
  };
  const colors = useColorScheme();

  return (
    <div
      className="min-w-min"
      style={{
        color: colors.$3,
        colorScheme: colors.$0,
        backgroundColor: colors.$1,
        borderColor: colors.$4,
      }}
    >
      <Card className="my-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <div
            className="flex w-full py-2 px-6 space-x-4"
            style={{
              color: colors.$3,
              colorScheme: colors.$0,
              backgroundColor: colors.$1,
              borderColor: colors.$4,
            }}
          >
            {columns.includes('client') && (
              <Column
                title={() => (
                  <div
                    className="flex justify-between items-center"
                    style={{
                      color: colors.$3,
                      colorScheme: colors.$0,
                      backgroundColor: colors.$1,
                      borderColor: colors.$4,
                    }}
                  >
                    <p>{t('client')}</p>

                    <button
                      type="button"
                      onClick={() => onAddAll(0)}
                      style={{
                        color: colors.$3,
                        colorScheme: colors.$0,
                        backgroundColor: colors.$1,
                        borderColor: colors.$4,
                      }}
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                )}
                data={data[0]}
                droppableId="0"
                isDropDisabled={true}
              />
            )}

            {columns.includes('invoice') && (
              <Column
                title={() => (
                  <div className="flex justify-between items-center">
                    <p>{t('invoice')}</p>

                    <button
                      type="button"
                      onClick={() => onAddAll(1)}
                      style={{
                        color: colors.$3,
                        colorScheme: colors.$0,
                        backgroundColor: colors.$1,
                        borderColor: colors.$4,
                      }}
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                )}
                data={data[1]}
                droppableId="1"
                isDropDisabled={true}
              />
            )}

            {columns.includes('credit') && (
              <Column
                title={() => (
                  <div
                    className="flex justify-between items-center"
                    style={{
                      color: colors.$3,
                      colorScheme: colors.$0,
                      backgroundColor: colors.$1,
                      borderColor: colors.$4,
                    }}
                  >
                    <p>{t('credit')}</p>

                    <button
                      type="button"
                      onClick={() => onAddAll(2)}
                      style={{
                        color: colors.$3,
                        colorScheme: colors.$0,
                        backgroundColor: colors.$1,
                        borderColor: colors.$4,
                      }}
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                )}
                data={data[2]}
                droppableId="2"
                isDropDisabled={true}
              />
            )}

            {columns.includes('quote') && (
              <Column
                title={() => (
                  <div
                    className="flex justify-between items-center"
                    style={{
                      color: colors.$3,
                      colorScheme: colors.$0,
                      backgroundColor: colors.$1,
                      borderColor: colors.$4,
                    }}
                  >
                    <p>{t('quote')}</p>

                    <button type="button" onClick={() => onAddAll(3)}>
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                )}
                data={data[3]}
                droppableId="3"
                isDropDisabled={true}
              />
            )}

            {columns.includes('payment') && (
              <Column
                title={() => (
                  <div
                    className="flex justify-between items-center"
                    style={{
                      color: colors.$3,
                      colorScheme: colors.$0,
                      backgroundColor: colors.$1,
                      borderColor: colors.$4,
                    }}
                  >
                    <p>{t('payment')}</p>

                    <button
                      type="button"
                      onClick={() => onAddAll(4)}
                      style={{
                        color: colors.$3,
                        colorScheme: colors.$0,
                        backgroundColor: colors.$1,
                        borderColor: colors.$4,
                      }}
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                )}
                data={data[4]}
                droppableId="4"
                isDropDisabled={true}
              />
            )}

            {columns.includes('vendor') && (
              <Column
                title={() => (
                  <div
                    className="flex justify-between items-center"
                    style={{
                      color: colors.$3,
                      colorScheme: colors.$0,
                      backgroundColor: colors.$1,
                      borderColor: colors.$4,
                    }}
                  >
                    <p>{t('vendor')}</p>

                    <button
                      type="button"
                      onClick={() => onAddAll(5)}
                      style={{
                        color: colors.$3,
                        colorScheme: colors.$0,
                        backgroundColor: colors.$1,
                        borderColor: colors.$4,
                      }}
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                )}
                data={data[5]}
                droppableId="5"
                isDropDisabled={true}
              />
            )}

            {columns.includes('purchase_order') && (
              <Column
                title={() => (
                  <div
                    className="flex justify-between items-center"
                    style={{
                      color: colors.$3,
                      colorScheme: colors.$0,
                      backgroundColor: colors.$1,
                      borderColor: colors.$4,
                    }}
                  >
                    <p>{t('purchase_order')}</p>

                    <button type="button" onClick={() => onAddAll(6)}>
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                )}
                data={data[6]}
                droppableId="6"
                isDropDisabled={true}
              />
            )}

            {columns.includes('task') && (
              <Column
                title={() => (
                  <div
                    className="flex justify-between items-center"
                    style={{
                      color: colors.$3,
                      colorScheme: colors.$0,
                      backgroundColor: colors.$1,
                      borderColor: colors.$4,
                    }}
                  >
                    <p>{t('task')}</p>

                    <button
                      type="button"
                      onClick={() => onAddAll(7)}
                      style={{
                        color: colors.$3,
                        colorScheme: colors.$0,
                        backgroundColor: colors.$1,
                        borderColor: colors.$4,
                      }}
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                )}
                data={data[7]}
                droppableId="7"
                isDropDisabled={true}
              />
            )}

            {columns.includes('expense') && (
              <Column
                title={() => (
                  <div
                    className="flex justify-between items-center"
                    style={{
                      color: colors.$3,
                      colorScheme: colors.$0,
                      backgroundColor: colors.$1,
                      borderColor: colors.$4,
                    }}
                  >
                    <p>{t('expense')}</p>

                    <button type="button" onClick={() => onAddAll(8)}>
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                )}
                data={data[8]}
                droppableId="8"
                isDropDisabled={true}
              />
            )}

            {columns.includes('recurring_invoice') && (
              <Column
                title={() => (
                  <div
                    className="flex justify-between items-center"
                    style={{
                      color: colors.$3,
                      colorScheme: colors.$0,
                      backgroundColor: colors.$1,
                      borderColor: colors.$4,
                    }}
                  >
                    <p>{t('recurring_invoice')}</p>

                    <button
                      type="button"
                      onClick={() => onAddAll(9)}
                      style={{
                        color: colors.$3,
                        colorScheme: colors.$0,
                        backgroundColor: colors.$1,
                        borderColor: colors.$4,
                      }}
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                )}
                data={data[9]}
                droppableId="9"
                isDropDisabled={true}
              />
            )}

            {columns.includes('contact') && (
              <Column
                title={() => (
                  <div
                    className="flex justify-between items-center"
                    style={{
                      color: colors.$3,
                      colorScheme: colors.$0,
                      backgroundColor: colors.$1,
                      borderColor: colors.$4,
                    }}
                  >
                    <p>{t('contact')}</p>

                    <button
                      type="button"
                      onClick={() => onAddAll(10)}
                      style={{
                        color: colors.$3,
                        colorScheme: colors.$0,
                        backgroundColor: colors.$1,
                        borderColor: colors.$4,
                      }}
                    >
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                )}
                data={data[10]}
                droppableId="10"
                isDropDisabled={true}
              />
            )}

            <Column
              title={() => (
                <div
                  className="flex items-center justify-between"
                  style={{
                    color: colors.$3,
                    colorScheme: colors.$0,
                    backgroundColor: colors.$1,
                    borderColor: colors.$4,
                  }}
                >
                  <p>
                    {t('report')} {t('columns')}
                  </p>

                  <div
                    style={{
                      color: colors.$3,
                      colorScheme: colors.$0,
                      backgroundColor: colors.$1,
                      borderColor: colors.$4,
                    }}
                    className="flex items-end space-x-1 cursor-pointer"
                    onClick={onRemoveAll}
                  >
                    <X size={19} />
                    <span className="text-xs">({t('reset')})</span>
                  </div>
                </div>
              )}
              data={data[reportColumn]}
              droppableId={reportColumn.toString()}
              isDropDisabled={false}
              onRemove={onRemove}
            />
          </div>
        </DragDropContext>
      </Card>
    </div>
  );
}
