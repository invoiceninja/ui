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
import { Plus } from 'react-feather';
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
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { atom, useSetAtom } from 'jotai';
import classNames from 'classnames';
import { useColorScheme } from '$app/common/colors';
import { useThemeColorScheme } from '$app/pages/settings/user/components/StatusColorTheme';
import { GridDotsVertical } from '$app/components/icons/GridDotsVertical';
import { CircleXMark } from '$app/components/icons/CircleXMark';
import styled from 'styled-components';

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

const AddLineItemButton = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor};

  &:hover {
    background-color: ${({ theme }) => theme.hoverBackgroundColor};
  }
`;

export function ProductsTable(props: Props) {
  const [t] = useTranslation();
  const colors = useColorScheme();

  const themeColors = useThemeColorScheme();

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
      <Thead backgroundColor={themeColors.$5}>
        <Th></Th>

        {columns.map((column, index) => (
          <Th
            key={index}
            textColor={themeColors.$6}
            {...(index === 0
              ? {
                  withoutHorizontalPadding: true,
                  className: 'pr-2 lg:pr-2.5 xl:pr-4',
                }
              : {
                  withoutHorizontalPadding: true,
                  className: 'px-2',
                })}
          >
            {resolveTranslation(column)}
          </Th>
        ))}

        <Th></Th>
      </Thead>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="product-table">
          {(provided) => (
            <Tbody {...provided.droppableProps} innerRef={provided.innerRef}>
              {items.map((lineItem, index) => (
                <Draggable
                  key={getLineItemIndex(lineItem)}
                  draggableId={getLineItemIndex(lineItem).toString()}
                  index={getLineItemIndex(lineItem)}
                >
                  {(provided) => (
                    <Tr
                      innerRef={provided.innerRef}
                      key={getLineItemIndex(lineItem)}
                      tabIndex={index + 1}
                      {...provided.draggableProps}
                    >
                      <Td
                        width="1.5%"
                        className="px-2 border-b"
                        style={{ borderColor: colors.$20 }}
                        withoutPadding
                      >
                        <div
                          className="flex justify-center items-center focus:outline-none focus:ring-0"
                          {...provided.dragHandleProps}
                          onMouseEnter={(e) => e.currentTarget.focus()}
                        >
                          <GridDotsVertical size="1.3rem" color={colors.$17} />
                        </div>
                      </Td>

                      {columns.map((column, columnIndex, { length }) => (
                        <Td
                          width={resolveColumnWidth(column)}
                          key={columnIndex}
                          {...(columnIndex === 0
                            ? {
                                className: 'pr-2 py-4 border-b',
                                withoutPadding: true,
                              }
                            : {
                                className: 'px-2 py-4 border-b',
                                withoutPadding: true,
                              })}
                          style={{ borderColor: colors.$20 }}
                        >
                          <div>
                            {resolveInputField(
                              column,
                              getLineItemIndex(lineItem)
                            )}
                          </div>
                        </Td>
                      ))}

                      <Td
                        width="5%"
                        className="px-2 py-4 border-b"
                        withoutPadding
                      >
                        <div className="flex justify-end">
                          {resource && (
                            <button
                              className="px-2"
                              onClick={() => {
                                setIsDeleteActionTriggered(true);

                                props.onDeleteRowClick(
                                  getLineItemIndex(lineItem)
                                );
                              }}
                            >
                              <CircleXMark
                                color={colors.$16}
                                hoverColor={colors.$3}
                                borderColor={colors.$5}
                                hoverBorderColor={colors.$17}
                                size="1.6rem"
                              />
                            </button>
                          )}
                        </div>
                      </Td>
                    </Tr>
                  )}
                </Draggable>
              ))}

              {provided.placeholder}

              <Tr>
                <Td colSpan={100} className="p-1" withoutPadding>
                  <AddLineItemButton
                    className={classNames(
                      'w-full py-4 inline-flex justify-center items-center space-x-2 rounded-[0.1875rem]',
                      {
                        'cursor-not-allowed': isAnyLineItemEmpty(),
                        'cursor-pointer': !isAnyLineItemEmpty(),
                      }
                    )}
                    onClick={(event) => {
                      event.stopPropagation();

                      !isAnyLineItemEmpty() && props.onCreateItemClick();
                    }}
                    theme={{
                      backgroundColor: colors.$1,
                      hoverBackgroundColor: colors.$20,
                    }}
                  >
                    <div>
                      <Plus size="1.15rem" color={colors.$17} />
                    </div>

                    <span className="font-medium">
                      {props.type === 'product' ? t('add_item') : t('add_line')}
                    </span>
                  </AddLineItemButton>
                </Td>
              </Tr>
            </Tbody>
          )}
        </Droppable>
      </DragDropContext>
    </Table>
  );
}
