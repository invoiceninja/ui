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
import { AlignJustify, Plus, Trash2 } from 'react-feather';
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
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { isEqual } from 'lodash';

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

interface LineItemRowProps {
  lineItem: InvoiceItem;
  lineItemIndex: number;
  columns: string[];
  resolveInputField: (column: string, index: number) => React.ReactNode;
  onDeleteClick: () => void;
  dragHandleProps: any;
  colors: ReturnType<typeof useColorScheme>;
  tabIndex: number;
  innerRef: any;
  draggableProps: any;
}

const LineItemRow = ({
  lineItem,
  lineItemIndex,
  columns,
  resolveInputField,
  onDeleteClick,
  dragHandleProps,
  colors,
  tabIndex,
  innerRef,
  draggableProps,
}: LineItemRowProps) => {
  if (lineItemIndex === -1) {
    return null;
  }

  return (
    <Tr innerRef={innerRef} tabIndex={tabIndex} {...draggableProps}>
      {columns.map((column, columnIndex, { length }) => (
        <Td width={resolveColumnWidth(column)} key={columnIndex}>
          {length - 1 !== columnIndex && (
            <div
              className={classNames({
                'flex justify-between items-center space-x-3':
                  columnIndex === 0,
              })}
            >
              {columnIndex === 0 ? (
                <button
                  {...dragHandleProps}
                  onMouseEnter={(e) => e.currentTarget.focus()}
                >
                  <AlignJustify size={18} />
                </button>
              ) : null}

              {resolveInputField(column, lineItemIndex)}
            </div>
          )}

          {length - 1 === columnIndex && (
            <div className="flex justify-between items-center">
              {resolveInputField(column, lineItemIndex)}

              <button
                style={{ color: colors.$3 }}
                className="ml-2 text-gray-600 hover:text-red-600"
                onClick={onDeleteClick}
              >
                <Trash2 size={18} />
              </button>
            </div>
          )}
        </Td>
      ))}
    </Tr>
  );
};

const MemoizedLineItemRow = memo(LineItemRow, (prev, next) =>
  isEqual(prev.lineItem, next.lineItem)
);

export function ProductsTable({
  type,
  resource,
  items,
  columns,
  relationType,
  onLineItemChange,
  onLineItemPropertyChange,
  onCreateItemClick,
  onDeleteRowClick,
  onSort,
}: Props) {
  const [t] = useTranslation();

  const colors = useColorScheme();
  const themeColors = useThemeColorScheme();

  const setIsDeleteActionTriggered = useSetAtom(isDeleteActionTriggeredAtom);

  const [currentItems, setCurrentItems] = useState<InvoiceItem[]>([]);
  const [areRowsRendered, setAreRowsRendered] = useState<boolean>(false);

  const resolveTranslation = useResolveTranslation({ type: type });

  const resolveInputField = useResolveInputField({
    type: type,
    resource: resource,
    onLineItemChange: onLineItemChange,
    onLineItemPropertyChange: onLineItemPropertyChange,
    relationType,
    createItem: onCreateItemClick,
    deleteLineItem: onDeleteRowClick,
  });

  const onDragEnd = useHandleSortingRows({
    resource: resource,
    onSort: onSort,
  });

  const isAnyLineItemEmpty = useCallback(() => {
    return currentItems.some((lineItem) => isLineItemEmpty(lineItem));
  }, [currentItems]);

  const getLineItemIndex = useCallback(
    (lineItem: InvoiceItem) => {
      return resource.line_items.indexOf(lineItem);
    },
    [resource.line_items]
  );

  const handleDeleteClick = useCallback(
    (lineItemIndex: number) => {
      setIsDeleteActionTriggered(true);
      onDeleteRowClick(lineItemIndex);
    },
    [onDeleteRowClick, setIsDeleteActionTriggered]
  );

  const handleAddItemClick = useCallback(() => {
    if (!isAnyLineItemEmpty()) {
      onCreateItemClick();
    }
  }, [isAnyLineItemEmpty, onCreateItemClick]);

  useEffect(() => {
    setAreRowsRendered(false);
  }, [resource?.updated_at]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (resource) {
        setCurrentItems(items);
        !areRowsRendered && setAreRowsRendered(true);
      }
    }, 10);

    return () => clearTimeout(timer);
  }, [items]);

  const tableHeader = useMemo(
    () => (
      <Thead backgroundColor={themeColors.$5}>
        {columns.map((column, index) => (
          <Th key={index} textColor={themeColors.$6}>
            {resolveTranslation(column)}
          </Th>
        ))}
      </Thead>
    ),
    [columns]
  );

  return (
    <Table>
      {tableHeader}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="product-table">
          {(provided) => (
            <Tbody
              {...provided.droppableProps}
              innerRef={provided.innerRef}
              style={{
                opacity: areRowsRendered || !currentItems.length ? 1 : 0.5,
                pointerEvents:
                  areRowsRendered || !currentItems.length ? 'auto' : 'none',
                cursor:
                  areRowsRendered || !currentItems.length
                    ? 'default'
                    : 'progress',
              }}
            >
              {currentItems.map((lineItem, index) => {
                const lineItemIndex = getLineItemIndex(lineItem);

                return (
                  <Draggable
                    key={lineItemIndex}
                    draggableId={lineItemIndex.toString()}
                    index={lineItemIndex}
                  >
                    {(provided) => (
                      <MemoizedLineItemRow
                        lineItem={lineItem}
                        lineItemIndex={lineItemIndex}
                        columns={columns}
                        resolveInputField={resolveInputField}
                        onDeleteClick={() => handleDeleteClick(lineItemIndex)}
                        dragHandleProps={provided.dragHandleProps}
                        colors={colors}
                        tabIndex={index + 1}
                        innerRef={provided.innerRef}
                        draggableProps={provided.draggableProps}
                      />
                    )}
                  </Draggable>
                );
              })}

              {provided.placeholder}

              <Tr className="bg-slate-100 hover:bg-slate-200">
                <Td colSpan={100}>
                  <button
                    onClick={handleAddItemClick}
                    className="w-full py-2 inline-flex justify-center items-center space-x-2"
                  >
                    <Plus size={18} />
                    <span>
                      {type === 'product' ? t('add_item') : t('add_line')}
                    </span>
                  </button>
                </Td>
              </Tr>
            </Tbody>
          )}
        </Droppable>
      </DragDropContext>
    </Table>
  );
}
