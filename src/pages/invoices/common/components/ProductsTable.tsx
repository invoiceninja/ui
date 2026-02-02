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
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import { resolveColumnWidth } from '../helpers/resolve-column-width';
import { Invoice } from '$app/common/interfaces/invoice';
import { InvoiceItem } from '$app/common/interfaces/invoice-item';
import { RecurringInvoice } from '$app/common/interfaces/recurring-invoice';
import { PurchaseOrder } from '$app/common/interfaces/purchase-order';
import { atom, useSetAtom } from 'jotai';
import classNames from 'classnames';
import { useColorScheme } from '$app/common/colors';
import { useThemeColorScheme } from '$app/pages/settings/user/components/StatusColorTheme';
import React, { memo, useCallback, useRef, useState } from 'react';
import { blankLineItem } from '$app/common/constants/blank-line-item';
import { InvoiceItemType } from '$app/common/interfaces/invoice-item';
import { v4 } from 'uuid';
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

interface ProductRowProps {
  lineItem: InvoiceItem;
  resourceIndex: number;
  tabIndex: number;
  columns: string[];
  resolveInputField: (
    key: string,
    index: number,
    lineItem: InvoiceItem
  ) => React.ReactNode;
  onDeleteRowClick: (index: number) => unknown;
}

const ProductRow = memo(
  function ProductRow(props: ProductRowProps) {
    const {
      lineItem,
      resourceIndex,
      tabIndex,
      columns,
      resolveInputField,
      onDeleteRowClick,
    } = props;

    const colors = useColorScheme();
    const setIsDeleteActionTriggered = useSetAtom(isDeleteActionTriggeredAtom);

    return (
      <Draggable
        key={resourceIndex}
        draggableId={resourceIndex.toString()}
        index={resourceIndex}
      >
        {(provided) => (
          <Tr
            innerRef={provided.innerRef}
            key={resourceIndex}
            tabIndex={tabIndex}
            {...provided.draggableProps}
          >
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
                        {...provided.dragHandleProps}
                        onMouseEnter={(e) => e.currentTarget.focus()}
                      >
                        <AlignJustify size={18} />
                      </button>
                    ) : null}

                    {resolveInputField(column, resourceIndex, lineItem)}
                  </div>
                )}

                {length - 1 === columnIndex && (
                  <div className="flex justify-between items-center">
                    {resolveInputField(column, resourceIndex, lineItem)}

                    <button
                      style={{ color: colors.$3 }}
                      className="ml-2 text-gray-600 hover:text-red-600"
                      onClick={() => {
                        setIsDeleteActionTriggered(true);
                        onDeleteRowClick(resourceIndex);
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </Td>
            ))}
          </Tr>
        )}
      </Draggable>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.resourceIndex !== nextProps.resourceIndex) return false;
    if (prevProps.tabIndex !== nextProps.tabIndex) return false;

    if (!isEqual(prevProps.lineItem, nextProps.lineItem)) return false;
    if (!isEqual(prevProps.columns, nextProps.columns)) return false;

    return true;
  }
);

function ProductsTableInner(props: Props) {
  const [t] = useTranslation();

  const themeColors = useThemeColorScheme();

  const { resource, columns, relationType } = props;

  const setIsDeleteActionTriggered = useSetAtom(isDeleteActionTriggeredAtom);

  const resolveTranslation = useResolveTranslation({ type: props.type });

  const [lineItems, setLineItems] = useState<InvoiceItem[]>(props.items);

  const getResourceIndex = useCallback(
    (lineItem: InvoiceItem): number => {
      return resource.line_items.findIndex((li) => li._id === lineItem._id);
    },
    [resource.line_items]
  );

  const onLineItemPropertyChangeRef = useRef(props.onLineItemPropertyChange);
  onLineItemPropertyChangeRef.current = props.onLineItemPropertyChange;

  const onLineItemChangeRef = useRef(props.onLineItemChange);
  onLineItemChangeRef.current = props.onLineItemChange;

  const onDeleteRowClickRef = useRef(props.onDeleteRowClick);
  onDeleteRowClickRef.current = props.onDeleteRowClick;

  const onCreateItemClickRef = useRef(props.onCreateItemClick);
  onCreateItemClickRef.current = props.onCreateItemClick;

  const onSortRef = useRef(props.onSort);
  onSortRef.current = props.onSort;

  const handleLineItemPropertyChange = useCallback(
    (key: keyof InvoiceItem, value: unknown, resourceIndex: number) => {
      setLineItems((prev) =>
        prev.map((item) =>
          getResourceIndex(item) === resourceIndex
            ? { ...item, [key]: value }
            : item
        )
      );

      onLineItemPropertyChangeRef.current(key, value, resourceIndex);
    },
    [getResourceIndex]
  );

  const handleLineItemChange = useCallback(
    (resourceIndex: number, lineItem: InvoiceItem) => {
      setLineItems((prev) =>
        prev.map((item) =>
          getResourceIndex(item) === resourceIndex ? lineItem : item
        )
      );

      onLineItemChangeRef.current(resourceIndex, lineItem);
    },
    [getResourceIndex]
  );

  const handleDeleteRowClick = useCallback(
    (resourceIndex: number) => {
      setLineItems((prev) =>
        prev.filter((item) => getResourceIndex(item) !== resourceIndex)
      );

      setIsDeleteActionTriggered(true);

      onDeleteRowClickRef.current(resourceIndex);
    },
    [getResourceIndex, setIsDeleteActionTriggered]
  );

  const handleCreateItemClick = useCallback(() => {
    const typeId =
      props.type === 'task' ? InvoiceItemType.Task : InvoiceItemType.Product;

    const newItem: InvoiceItem = {
      ...blankLineItem(),
      type_id: typeId,
      quantity: 1,
      _id: v4(),
    };

    setLineItems((prev) => [...prev, newItem]);

    onCreateItemClickRef.current();
  }, [props.type]);

  const isAnyLineItemEmpty = useCallback(() => {
    return lineItems.some((lineItem) => isLineItemEmpty(lineItem));
  }, [lineItems]);

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const sourceIndex = result.source.index;
      const destinationIndex = result.destination.index;

      if (sourceIndex === destinationIndex) return;

      setLineItems((prev) => {
        const reordered = [...prev];
        const [moved] = reordered.splice(sourceIndex, 1);
        reordered.splice(destinationIndex, 0, moved);

        // Build the full reordered line_items for the parent
        // by replacing the items of our type in resource.line_items
        const typeId =
          props.type === 'task'
            ? InvoiceItemType.Task
            : InvoiceItemType.Product;

        const otherItems = resource.line_items.filter(
          (li) => li.type_id !== typeId
        );

        const newLineItems = [...reordered, ...otherItems];

        // Notify parent asynchronously so we don't set state during render
        setTimeout(() => onSortRef.current(newLineItems), 0);

        return reordered;
      });
    },
    [props.type, resource.line_items]
  );

  const resolveInputFieldFn = useResolveInputField({
    type: props.type,
    resource: props.resource,
    onLineItemChange: handleLineItemChange,
    onLineItemPropertyChange: handleLineItemPropertyChange,
    relationType,
    createItem: handleCreateItemClick,
    deleteLineItem: handleDeleteRowClick,
  });

  const resolveInputFieldRef = useRef(resolveInputFieldFn);
  resolveInputFieldRef.current = resolveInputFieldFn;

  const stableResolveInputField = useCallback(
    (key: string, index: number, lineItem: InvoiceItem) => {
      return resolveInputFieldRef.current(key, index, lineItem);
    },
    []
  );

  return (
    <Table>
      <Thead backgroundColor={themeColors.$5}>
        {columns.map((column, index) => (
          <Th key={index} textColor={themeColors.$6}>
            {resolveTranslation(column)}
          </Th>
        ))}
      </Thead>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="product-table">
          {(provided) => (
            <Tbody {...provided.droppableProps} innerRef={provided.innerRef}>
              {lineItems.map((lineItem, index) => (
                <ProductRow
                  key={lineItem._id}
                  lineItem={lineItem}
                  resourceIndex={getResourceIndex(lineItem)}
                  tabIndex={index + 1}
                  columns={columns}
                  resolveInputField={stableResolveInputField}
                  onDeleteRowClick={handleDeleteRowClick}
                />
              ))}

              {provided.placeholder}

              <Tr className="bg-slate-100 hover:bg-slate-200">
                <Td colSpan={100}>
                  <button
                    onClick={() =>
                      !isAnyLineItemEmpty() && handleCreateItemClick()
                    }
                    className="w-full py-2 inline-flex justify-center items-center space-x-2"
                  >
                    <Plus size={18} />
                    <span>
                      {props.type === 'product' ? t('add_item') : t('add_line')}
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

export const ProductsTable = memo(
  ProductsTableInner,
  (prevProps, nextProps) => {
    if (!isEqual(prevProps.columns, nextProps.columns)) return false;

    return true;
  }
);
