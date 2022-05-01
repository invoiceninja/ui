/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Table, Tbody, Td, Th, Thead, Tr } from '@invoiceninja/tables';
import { useCurrentRecurringInvoice } from 'common/hooks/useCurrentRecurringInvoice';

import { injectBlankItemIntoCurrent } from 'common/stores/slices/recurring-invoices';
import { TaxCreate } from 'pages/invoices/common/components/TaxCreate';
import { ProductCreate } from 'pages/invoices/common/components/ProductCreate';
import { useProductColumns } from 'pages/invoices/common/hooks/useProductColumns';
import { useResolveTranslation } from 'pages/invoices/common/hooks/useResolveTranslation';
import { useState } from 'react';
import { Plus, Trash2 } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useResolveInputField } from '../hooks/useResolveInputField';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import { useHandleSortingRows } from '../hooks/useHandleSortingRows';
import { deleteRecurringInvoiceItem } from 'common/stores/slices/recurring-invoices/extra-reducers/delete-recurring-invoice-item';
import { setCurrentLineItemProperty } from 'common/stores/slices/recurring-invoices/extra-reducers/set-current-line-item-property';

export function ProductsTable() {
  const [t] = useTranslation();

  const invoice = useCurrentRecurringInvoice();
  const columns = useProductColumns();

  const resolveTranslation = useResolveTranslation();
  const dispatch = useDispatch();

  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [currentLineItemIndex, setCurrentLineItemIndex] = useState(0);

  const resolveInputField = useResolveInputField({
    setIsTaxModalOpen,
    setIsProductModalOpen,
    setCurrentLineItemIndex,
  });

  const onDragEnd = useHandleSortingRows();

  return (
    <div>
      <Table>
        <Thead>
          {columns.map((column, index) => (
            <Th key={index}>{resolveTranslation(column)}</Th>
          ))}
          <Th>{/* This is placeholder for "Remove" button. */}</Th>
        </Thead>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="recurring-invoice-product-table">
            {(provided) => (
              <Tbody {...provided.droppableProps} innerRef={provided.innerRef}>
                {invoice?.client_id &&
                  invoice.line_items.map((lineItem, lineItemIndex) => (
                    <Draggable
                      key={lineItemIndex}
                      draggableId={lineItemIndex.toString()}
                      index={lineItemIndex}
                    >
                      {(provided) => (
                        <Tr
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          innerRef={provided.innerRef}
                          key={lineItemIndex}
                        >
                          {columns.map((column, columnIndex) => (
                            <Td key={columnIndex}>
                              {resolveInputField(column, lineItemIndex)}
                            </Td>
                          ))}

                          <Td>
                            {invoice &&
                              (lineItem.product_key || lineItemIndex > 0) &&
                              invoice.line_items.length > 0 && (
                                <button
                                  className="text-gray-600 hover:text-red-600"
                                  onClick={() =>
                                    dispatch(
                                      deleteRecurringInvoiceItem(lineItemIndex)
                                    )
                                  }
                                >
                                  <Trash2 size={18} />
                                </button>
                              )}
                          </Td>
                        </Tr>
                      )}
                    </Draggable>
                  ))}

                {invoice?.client_id && (
                  <Tr>
                    <Td colSpan={100}>
                      <button
                        onClick={() => dispatch(injectBlankItemIntoCurrent())}
                        className="w-full py-2 inline-flex justify-center items-center space-x-2"
                      >
                        <Plus size={18} />
                        <span>{t('add_item')}</span>
                      </button>
                    </Td>
                  </Tr>
                )}

                {!invoice?.client_id && (
                  <Tr>
                    <Td colSpan={100}>{t('no_client_selected')}.</Td>
                  </Tr>
                )}
              </Tbody>
            )}
          </Droppable>
        </DragDropContext>
      </Table>

      <TaxCreate isVisible={isTaxModalOpen} onClose={setIsTaxModalOpen} />

      <ProductCreate
        setIsModalOpen={setIsProductModalOpen}
        isModalOpen={isProductModalOpen}
        onProductCreated={(product) =>
          dispatch(
            setCurrentLineItemProperty({
              position: currentLineItemIndex,
              property: 'product_key',
              value: product.product_key,
            })
          )
        }
      />
    </div>
  );
}
