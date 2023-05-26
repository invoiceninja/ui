/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Element } from '$app/components/cards';
import { SelectField } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { MdArrowCircleRight, MdClose, MdDragHandle } from 'react-icons/md';
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from '@hello-pangea/dnd';
import { Report } from '../../index/Reports';
import { useTranslation } from 'react-i18next';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { arrayMoveImmutable } from 'array-move';

interface Props {
  report: Report;
  setReport: Dispatch<SetStateAction<Report>>;
}

export const getColumnWithoutEntityName = (
  reportKey: string,
  report: Report
) => {
  return reportKey.replace(`${report.entityName}.`, '');
};

export function ColumnSelection(props: Props) {
  const [t] = useTranslation();

  const { report, setReport } = props;

  const [availableColumn, setAvailableColumn] = useState<string>('all');

  const isColumnSelected = (column: string) => {
    return report.payload.report_keys.some(
      (key) => key === `${report.entityName}.${column}`
    );
  };

  const handleResetSelectedColumns = () => {
    setAvailableColumn('all');

    setReport((current) => ({
      ...current,
      payload: {
        ...current.payload,
        report_keys: [],
      },
    }));
  };

  const onDragEnd = (result: DropResult) => {
    const sorted = arrayMoveImmutable(
      report.payload.report_keys,
      result.source.index,
      result.destination?.index as unknown as number
    );

    setReport((current) => ({
      ...current,
      payload: {
        ...current.payload,
        report_keys: sorted,
      },
    }));
  };

  const handleReportKeysChange = (
    keyIdentifier: string,
    action: 'setAll' | 'add' | 'remove'
  ) => {
    if (action === 'add') {
      const doesKeyExist = isColumnSelected(keyIdentifier);
      const isCurrentAll = !report.payload.report_keys.length;

      if (!doesKeyExist) {
        const updatedFilterKeys =
          report.payload.filters?.filter(({ key }) => key === keyIdentifier) ||
          [];

        setReport((current) => ({
          ...current,
          payload: {
            ...current.payload,
            report_keys: [...current.payload.report_keys, keyIdentifier],
            filters: isCurrentAll ? updatedFilterKeys : report.payload.filters,
          },
        }));
      }
    } else if (action === 'remove') {
      const filteredReportKeys = report.payload.report_keys.filter(
        (reportKey) => reportKey !== keyIdentifier
      );

      const shouldAllBeSelected = Boolean(!filteredReportKeys.length);

      const filteredReportFilters =
        report.payload.filters?.filter(
          (filter) => filter.key !== keyIdentifier
        ) || [];

      setReport((current) => ({
        ...current,
        payload: {
          ...current.payload,
          report_keys: filteredReportKeys,
          filters: shouldAllBeSelected
            ? report.payload.filters
            : filteredReportFilters,
        },
      }));
    } else {
      setReport((current) => ({
        ...current,
        payload: {
          ...current.payload,
          report_keys: [],
        },
      }));
    }
  };

  useEffect(() => {
    if (availableColumn === 'all') {
      handleReportKeysChange(availableColumn, 'setAll');
    } else if (availableColumn) {
      const updatedColumn = `${report.entityName}.${availableColumn}`;

      handleReportKeysChange(updatedColumn, 'add');
    }

    availableColumn && availableColumn !== 'all' && setAvailableColumn('');
  }, [availableColumn]);

  return (
    <>
      <Element leftSide={t('Available columns')}>
        <div className="flex items-center gap-x-5">
          <SelectField
            value={availableColumn}
            onValueChange={(value) =>
              !isColumnSelected(value) && setAvailableColumn(value)
            }
            withBlank
            style={{ width: '11rem' }}
          >
            <option value="all">{t('all')}</option>

            {report.availableKeys?.map((key) => (
              <option key={key} value={key}>
                {t(key)}
              </option>
            ))}
          </SelectField>

          <Icon element={MdArrowCircleRight} size={25} />

          <div className="flex flex-col flex-1 mb-6">
            <div className="flex justify-between items-end">
              <span className="text-gray-600 mb-1">Selected columns</span>

              {report.payload.report_keys.length ? (
                <div
                  className="text-gray-800 text-xs mb-1 cursor-pointer"
                  onClick={handleResetSelectedColumns}
                >
                  {t('reset')}
                </div>
              ) : null}
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="columns">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex flex-col px-3 py-2 w-full border border-gray-300 rounded"
                  >
                    {report.payload.report_keys.map((column, index) => (
                      <Draggable
                        key={index}
                        draggableId={`item-${index}`}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="w-full inline-flex items-center justify-between pr-4 py-2"
                          >
                            <div className="space-x-2 inline-flex items-center">
                              <Icon
                                className="cursor-pointer"
                                element={MdClose}
                                onClick={() =>
                                  handleReportKeysChange(column, 'remove')
                                }
                              />

                              <p>
                                {t(getColumnWithoutEntityName(column, report))}
                              </p>
                            </div>

                            <div className="cursor-grab">
                              <Icon element={MdDragHandle} size={22} />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {!report.payload.report_keys.length && (
                      <span>{t('all')}</span>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        </div>
      </Element>
    </>
  );
}
