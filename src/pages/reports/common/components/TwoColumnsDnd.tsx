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
import { Dispatch, SetStateAction, useState } from 'react';
import {
  DragDropContext,
  DropResult,
  Droppable,
  Draggable,
} from '@hello-pangea/dnd';
import { cloneDeep } from 'lodash';
import { clientMap } from '$app/common/constants/exports/client-map';
import { invoiceMap } from '$app/common/constants/exports/invoice-map';
import { paymentMap } from '$app/common/constants/exports/payment-map';
import { t } from 'i18next';
import { quoteMap } from '$app/common/constants/exports/quote-map';
import { creditMap } from '$app/common/constants/exports/credit-map';
import collect from 'collect.js';
import { useTranslation } from 'react-i18next';
import { ChevronsRight, X } from 'react-feather';
import { itemMap } from '$app/common/constants/exports/item-map';

interface Record {
  trans: string;
  value: string;
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

  const translateLabel = (record: Record) => {
    const parts = record.value.split('.');

    return `${t(`${parts[0]}`)} - ${t(`${record.trans}`)}`;
  };

  return (
    <Droppable droppableId={droppableId} isDropDisabled={isDropDisabled}>
      {(provided) => (
        <div
          className="w-80 flex-column"
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          <h2 className="text-gray-500 font-medium">
            {typeof title === 'string' ? <p>{title}</p> : title()}
          </h2>
          <div className="overflow-y-scroll h-96 mt-2 border rounded-md divide-y">
            {data.map((record: Record, i: number) => (
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
                      className="p-2 flex justify-between items-center bg-white cursor-move ml-2 text-sm"
                      key={i}
                    >
                      {translateLabel(record)}

                      {droppableId === '5' && (
                        <button
                          type="button"
                          onClick={() => (onRemove ? onRemove(record) : null)}
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
  );
}

interface Props {
  columns: string[];
  reportKeys: string[];
  setReportKeys: Dispatch<SetStateAction<string[]>>;
}

const positions = ['client', 'invoice', 'credit', 'quote', 'payment'];

export function TwoColumnsDnd(props: Props) {
  const [data, setData] = useState([
    props.columns.includes('client') ? clientMap : [],
    props.columns.includes('invoice')
      ? props.columns.includes('item')
        ? invoiceMap.concat(itemMap)
        : invoiceMap
      : [],
    props.columns.includes('credit')
      ? props.columns.includes('item')
        ? creditMap.concat(itemMap)
        : creditMap
      : [],
    props.columns.includes('quote')
      ? props.columns.includes('item')
        ? quoteMap.concat(itemMap)
        : quoteMap
      : [],
    props.columns.includes('payment') ? paymentMap : [],
    [],
  ]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }
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

    setData(() => [...$data]);

    props.setReportKeys(collect($data[5]).pluck('value').toArray());
  };

  const onRemove = (record: Record) => {
    // Find where's the original
    const type = record.value.split('.')[0];
    const index = positions.indexOf(type);

    // Remove it from the reports
    const $data = cloneDeep(data);

    $data[5] = $data[5].filter((r) => r.value !== record.value);

    // Add it back to the original
    $data[index].push(record);

    setData(() => [...$data]);
  };

  const onRemoveAll = () => {
    setData(() => [
      props.columns.includes('client') ? clientMap : [],
      props.columns.includes('invoice')
        ? props.columns.includes('item')
          ? invoiceMap.concat(itemMap)
          : invoiceMap
        : [],
      props.columns.includes('credit')
        ? props.columns.includes('item')
          ? creditMap.concat(itemMap)
          : creditMap
        : [],
      props.columns.includes('quote')
        ? props.columns.includes('item')
          ? quoteMap.concat(itemMap)
          : quoteMap
        : [],
      props.columns.includes('payment') ? paymentMap : [],
      [],
    ]);
  };

  const onAddAll = (index: number) => {
    const $data = cloneDeep(data);

    $data[5] = [...$data[5], ...$data[index]];

    $data[index] = [];

    setData(() => [...$data]);
  };

  return (
    <div className="min-w-min">
      <Card className="my-6">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex w-full py-2 px-6 space-x-4">
            {data[0].length > 0 && (
              <Column
                title={() => (
                  <div className="flex justify-between items-center">
                    <p>{t('client')}</p>

                    <button type="button" onClick={() => onAddAll(0)}>
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                )}
                data={data[0]}
                droppableId="0"
                isDropDisabled={true}
              />
            )}

            {data[1].length > 0 && (
              <Column
                title={() => (
                  <div className="flex justify-between items-center">
                    <p>{t('invoice')}</p>

                    <button type="button" onClick={() => onAddAll(1)}>
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                )}
                data={data[1]}
                droppableId="1"
                isDropDisabled={true}
              />
            )}

            {data[2].length > 0 && (
              <Column
                title={() => (
                  <div className="flex justify-between items-center">
                    <p>{t('credit')}</p>

                    <button type="button" onClick={() => onAddAll(2)}>
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                )}
                data={data[2]}
                droppableId="2"
                isDropDisabled={true}
              />
            )}

            {data[3].length > 0 && (
              <Column
                title={() => (
                  <div className="flex justify-between items-center">
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

            {data[4].length > 0 && (
              <Column
                title={() => (
                  <div className="flex justify-between items-center">
                    <p>{t('payment')}</p>

                    <button type="button" onClick={() => onAddAll(4)}>
                      <ChevronsRight size={16} />
                    </button>
                  </div>
                )}
                data={data[4]}
                droppableId="4"
                isDropDisabled={true}
              />
            )}

            <Column
              title={() => (
                <div className="flex items-center justify-between">
                  <p>
                    {t('report')} {t('columns')}
                  </p>

                  <button type="button" onClick={onRemoveAll}>
                    <X size={16} />
                  </button>
                </div>
              )}
              data={data[5]}
              droppableId="5"
              isDropDisabled={false}
              onRemove={onRemove}
            />
          </div>
        </DragDropContext>
      </Card>
    </div>
  );
}
