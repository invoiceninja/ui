/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Icon } from '$app/components/icons/Icon';
import {
  MdAdd,
  MdArrowCircleRight,
  MdClose,
  MdDragHandle,
  MdSearch,
} from 'react-icons/md';
import {
  DragDropContext,
  Draggable,
  DropResult,
  Droppable,
} from '@hello-pangea/dnd';
import { Report } from '../../index/Reports';
import { useTranslation } from 'react-i18next';
import { Dispatch, SetStateAction } from 'react';
import { arrayMoveImmutable } from 'array-move';
import { InputField } from '$app/components/forms';

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

export function ColumnSelection({ report, setReport }: Props) {
  const [t] = useTranslation();

  const isColumnSelected = (column: string) => {
    return report.payload.report_keys.some((key) => key === column);
  };

  const handleResetSelectedColumns = () => {
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

  return (
    <div className="flex items-center gap-x-5 py-5 px-3">
      <div className="flex flex-1 flex-col">
        <span className="text-gray-600 mb-1">Available Columns</span>

        <div className="flex border border-gray-300 rounded mb-1">
          <div className="flex items-center bg-gray-100 rounded px-2">
            <Icon element={MdSearch} size={20} />
          </div>

          <InputField className="ring-0 border-0 focus:ring-0" />
        </div>

        <div className="flex flex-col overflow-y-auto h-96 w-full border border-gray-300 rounded py-1 px-2">
          {report.availableKeys?.map((key) => (
            <div
              key={key}
              className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <span>{t(key)}</span>

              <div
                className="hover:bg-gray-200 rounded-xl p-[0.18rem]"
                onClick={() =>
                  !isColumnSelected(key) && handleReportKeysChange(key, 'add')
                }
              >
                <Icon element={MdAdd} size={20} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Icon element={MdArrowCircleRight} size={30} />

      <div className="flex flex-col flex-1 self-start">
        <div className="flex justify-between items-end">
          <span className="text-gray-600 mb-1">Selected columns</span>

          {Boolean(report.payload.report_keys.length) && (
            <div
              className="text-gray-800 text-xs mb-1 cursor-pointer"
              onClick={handleResetSelectedColumns}
            >
              {t('reset')}
            </div>
          )}
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="columns">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex flex-col px-3 py-2 w-full border border-gray-300 rounded overflow-auto"
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

                          <p>{t(getColumnWithoutEntityName(column, report))}</p>
                        </div>

                        <div className="cursor-grab">
                          <Icon element={MdDragHandle} size={22} />
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}

                {!report.payload.report_keys.length && <span>{t('all')}</span>}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}
