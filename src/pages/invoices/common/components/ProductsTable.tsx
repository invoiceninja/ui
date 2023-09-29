/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Table, Tbody, Td, Th, Thead, Tr } from '$app/components/tables';
import { Plus, Trash2 } from 'react-feather';
import { useTranslation } from 'react-i18next';
import {
  isLineItemEmpty,
  useResolveInputField,
} from '../hooks/useResolveInputField';
import { useResolveTranslation } from '../hooks/useResolveTranslation';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { useHandleSortingRows } from '../hooks/useHandleSortingRows';
import { resolveColumnWidth } from '../helpers/resolve-column-width';
import { Invoice } from '$app/common/interfaces/invoice';
import { InvoiceItem } from '$app/common/interfaces/invoice-item';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { Fragment } from 'react';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { atom, useSetAtom } from 'jotai';

export type ProductTableResource = Invoice | RecurringInvoice | PurchaseOrder;
export type RelationType = 'client_id' | 'vendor_id';

export const isDeleteActionTriggeredAtom = atom<boolean | undefined>(undefined);

interface Props {
  type: 'product' | 'task';
  resource: ProductTableResource;
  items: InvoiceItem[];
  columns: string[];
  relationType: RelationType;
  onLineItemChange: (index: number, lineItem: InvoiceItem) => unknown;
  onSort: (lineItems: InvoiceItem[]) => unknown;
  onLineItemPropertyChange: (
    key: keyof InvoiceItem,
    value: unknown,
    index: number
  ) => unknown;
  onDeleteRowClick: (index: number) => unknown;
  onCreateItemClick: () => unknown;
  shouldCreateInitialLineItem?: boolean;
}

export function ProductsTable(props: Props) {
  const [t] = useTranslation();

  const { resource, items, columns, relationType } = props;

  const setIsDeleteActionTriggered = useSetAtom(isDeleteActionTriggeredAtom);

  const resolveTranslation = useResolveTranslation({ type: props.type });

  const resolveInputField = useResolveInputField({
    type: props.type,
    resource: props.resource,
    onLineItemChange: props.onLineItemChange,
    onLineItemPropertyChange: props.onLineItemPropertyChange,
    relationType,
    createItem: props.onCreateItemClick,
    deleteLineItem: props.onDeleteRowClick,
  });

  const onDragEnd = useHandleSortingRows({
    resource: props.resource,
    onSort: props.onSort,
  });

  const isAnyLineItemEmpty = () => {
    return items.some((lineItem) => isLineItemEmpty(lineItem));
  };

  const getLineItemIndex = (lineItem: InvoiceItem) => {
    return resource.line_items.indexOf(lineItem);
  };

  // This portion of the code pertains to the automatic creation of line items.
  // Currently, we do not support this functionality, and we will comment it out until we begin providing support for it.

  /*useEffect(() => {
    if (
      (resource.client_id || resource.vendor_id) &&
      !resource.line_items.length &&
      (shouldCreateInitialLineItem ||
        typeof shouldCreateInitialLineItem === 'undefined') &&
      !isEditPage
    ) {
      props.onCreateItemClick();
    }
  }, [resource.client_id, resource.vendor_id]); */

  return (
    <Table>
      <Thead>
        {columns.map((column, index) => (
          <Th key={index}>{resolveTranslation(column)}</Th>
        ))}
      </Thead>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="product-table">
          {(provided) => (
            <Tbody {...provided.droppableProps} innerRef={provided.innerRef}>
              {resource?.[relationType] ? (
                items.map((lineItem, index) => (
                  <Draggable
                    key={getLineItemIndex(lineItem)}
                    draggableId={getLineItemIndex(lineItem).toString()}
                    index={getLineItemIndex(lineItem)}
                  >
                    {(provided) => (
                      <Tr
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        innerRef={provided.innerRef}
                        key={getLineItemIndex(lineItem)}
                        tabIndex={index + 1}
                      >
                        {columns.map((column, columnIndex, { length }) => (
                          <Td
                            width={resolveColumnWidth(column)}
                            key={columnIndex}
                          >
                            {length - 1 !== columnIndex &&
                              resolveInputField(
                                column,
                                getLineItemIndex(lineItem)
                              )}

                            {length - 1 === columnIndex && (
                              <div className="flex justify-between items-center">
                                {resolveInputField(
                                  column,
                                  getLineItemIndex(lineItem)
                                )}

                                {resource && (
                                  <button
                                    className="ml-2 text-gray-600 hover:text-red-600"
                                    onClick={() => {
                                      setIsDeleteActionTriggered(true);

                                      props.onDeleteRowClick(
                                        getLineItemIndex(lineItem)
                                      );
                                    }}
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                )}
                              </div>
                            )}
                          </Td>
                        ))}
                      </Tr>
                    )}
                  </Draggable>
                ))
              ) : (
                <Fragment />
              )}

              {resource?.[relationType] ? (
                <Tr className="bg-slate-100 hover:bg-slate-200">
                  <Td colSpan={100}>
                    <button
                      onClick={() =>
                        !isAnyLineItemEmpty() && props.onCreateItemClick()
                      }
                      className="w-full py-2 inline-flex justify-center items-center space-x-2"
                    >
                      <Plus size={18} />
                      <span>{t('add_item')}</span>
                    </button>
                  </Td>
                </Tr>
              ) : (
                <Fragment />
              )}

              {!resource?.[relationType] ? (
                <Tr>
                  <Td colSpan={100}>
                    {props.relationType === 'vendor_id'
                      ? t('please_select_a_vendor')
                      : t('please_select_a_client')}
                    .
                  </Td>
                </Tr>
              ) : (
                <Fragment />
              )}
            </Tbody>
          )}
        </Droppable>
      </DragDropContext>
    </Table>
  );
}
