/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Card, Element } from '$app/components/cards';
import { useState } from 'react';
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

export function TwoColumnsDnd() {
    const [data, setData] = useState([
        clientMap,
        invoiceMap,
        paymentMap,
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
console.log($data);

        setData(() => [...$data]);
    };

    interface Record {
        trans: string;
        value: string;
    }

    return (
        <div className="max-w-5xl">
            <Card className="my-6">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex w-full">
                        <Droppable droppableId="0">
                            {(provided) => (
                                <div
                                    className="w-1/2 border border-dashed flex-column h-screen"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    <h2>{t('client')}</h2>
                                    {data[0].map((record: Record, i: number) => (
                                        <Draggable
                                            key={record.value}
                                            draggableId={`left-word-${record.value}`}
                                            index={i}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <span className="p-4 mb-3 flex justify-between items-center bg-white shadow rounded-lg cursor-move ml-2 text-gray-700 font-semibold font-sans tracking-wide" key={i}>{`${t('client')} ${t(`${record.trans}`)}`}</span>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>



                        <Droppable droppableId="1">
                            {(provided) => (
                                <div
                                    className="w-1/2 border border-dashed flex-column h-screen"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    <h2>{t('Invoice')}</h2>
                                    {data[1].map((record: Record, i: number) => (
                                        <Draggable
                                            key={record.value}
                                            draggableId={`left-word-${record.value}`}
                                            index={i}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className='content-start'
                                                >
                                                    <span className="p-4 mb-3 flex justify-between items-center bg-white shadow rounded-lg cursor-move ml-2 text-gray-700 font-semibold font-sans tracking-wide" key={i}>{`${t('invoice')} ${t(`${record.trans}`)}`}</span>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>


                        <Droppable droppableId="2">
                            {(provided) => (
                                <div
                                    className="w-1/2 border border-dashed flex-column h-screen items-center"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    <h2>{t('payment')}</h2>

                                    {data[2].map((record: Record, i: number) => (
                                        <Draggable
                                            key={record.value}
                                            draggableId={`left-word-${record.value}`}
                                            index={i}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <span className="p-4 mb-3 flex justify-between items-center bg-white shadow rounded-lg cursor-move ml-2 text-gray-700 font-semibold font-sans tracking-wide" key={i}>{`${t('payment')} ${t(`${record.trans}`)}`}</span>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>

                        <Droppable droppableId="3">
                            {(provided) => (
                                <>
                                
                                <div
                                    className="w-1/2 border border-dashed flex-column h-screen items-center"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                >
                                    <h2>{`${t('report')} ${t('columns')}`}</h2>

                                    {data[3].map((record: Record, i: number) => (
                                        <Draggable
                                            key={record.value}
                                            draggableId={`right-word-${record.value}`}
                                            index={i}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                >
                                                    <span className="p-4 mb-3 flex justify-between items-center bg-white shadow rounded-lg cursor-move ml-2 text-gray-700 font-semibold font-sans tracking-wide" key={i}>{`${t('client')} ${t(`${record.trans}`)}`}</span>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                                </>
                            )}
                        </Droppable>

                    </div>
                </DragDropContext>
            </Card>
        </div>
    );
}
