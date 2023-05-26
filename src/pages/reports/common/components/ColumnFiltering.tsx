/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ChangeEvent, Dispatch, SetStateAction, useState } from 'react';
import { Filter, Report } from '../../index/Reports';
import { useTranslation } from 'react-i18next';
import { Button, InputField, SelectField } from '$app/components/forms';
import { Icon } from '$app/components/icons/Icon';
import { MdAdd, MdDelete } from 'react-icons/md';
import { getColumnWithoutEntityName } from './ColumnSelection';

interface Props {
  report: Report;
  setReport: Dispatch<SetStateAction<Report>>;
}

const DEFAULT_FILTER: Filter = {
  key: '',
  operator: 'contains',
  value: '',
};

const OPERATORS = {
  string: [
    { value: 'contains', label: 'contains' },
    { value: 'starts_with', label: 'starts_with' },
    { value: 'is', label: 'is' },
    { value: 'is_empty', label: 'is_empty' },
  ],
  number: [
    { value: '<', label: '<' },
    { value: '<=', label: '<=' },
    { value: '=', label: '=' },
    { value: '>', label: '>' },
    { value: '>=', label: '>=' },
  ],
  id: [
    { value: '=', label: '=' },
    { value: '!=', label: '!=' },
  ],
};

export function ColumnFiltering(props: Props) {
  const [t] = useTranslation();

  const { report, setReport } = props;

  const [internalFilter, setInternalFilter] = useState<Filter>();

  const getFilteringColumns = () => {
    if (report.payload.report_keys?.length) {
      return report.payload.report_keys;
    }

    const updatedAvailableKeys = report.availableKeys?.map(
      (key) => `${report.entityName}.${key}`
    );

    return updatedAvailableKeys || [];
  };

  const handleChangeFilterOperator = (filterIndex: number, value: string) => {
    const updatedFilters = report.payload.filters?.map((filter, index) => ({
      ...filter,
      operator: index === filterIndex ? value : filter.operator,
    }));

    setReport((currentReport) => ({
      ...currentReport,
      payload: {
        ...currentReport.payload,
        filters: updatedFilters,
      },
    }));
  };

  const handleChangeFilterValue = (filterIndex: number, value: string) => {
    const updatedFilters = report.payload.filters?.map((filter, index) => ({
      ...filter,
      value: index === filterIndex ? value : filter.value,
    }));

    setReport((currentReport) => ({
      ...currentReport,
      payload: {
        ...currentReport.payload,
        filters: updatedFilters,
      },
    }));
  };

  const getFilterOperators = (filterIndex: number) => {
    const filter = report.payload.filters?.find(
      (_, index) => filterIndex === index
    );

    if (filter) {
      const updatedFilter = getColumnWithoutEntityName(filter.key, report);

      if (updatedFilter === 'id') {
        return OPERATORS.id;
      }

      if (
        report.blankEntity &&
        typeof report.blankEntity[
          updatedFilter as keyof typeof report.blankEntity
        ] === 'number'
      ) {
        return OPERATORS.number;
      }
    }

    return OPERATORS.string;
  };

  const handleChangeFilterColumn = (column: string, filterIndex: number) => {
    let defaultOperator = 'contains';

    const updatedColumn = getColumnWithoutEntityName(column, report);

    console.log(column);

    if (updatedColumn === 'id') {
      defaultOperator = '=';
    }

    if (
      report.blankEntity &&
      typeof report.blankEntity[
        updatedColumn as keyof typeof report.blankEntity
      ] === 'number'
    ) {
      defaultOperator = '<';
    }

    if (filterIndex < 0) {
      setReport((currentReport) => ({
        ...currentReport,
        payload: {
          ...currentReport.payload,
          filters: [
            ...(currentReport.payload.filters || []),
            { key: column, operator: defaultOperator, value: '' },
          ],
        },
      }));

      setInternalFilter(undefined);
    } else {
      const updatedFilters = report.payload.filters?.map((filter, index) => ({
        ...filter,
        key: index === filterIndex ? column : filter.key,
        operator: index === filterIndex ? defaultOperator : filter.operator,
        value: index === filterIndex ? '' : filter.value,
      }));

      if (updatedFilters) {
        setReport((currentReport) => ({
          ...currentReport,
          payload: {
            ...currentReport.payload,
            filters: updatedFilters,
          },
        }));
      }
    }
  };

  const handleRemoveFilter = (filterIndex: number) => {
    const filteredFilters =
      report.payload.filters?.filter((_, index) => index !== filterIndex) || [];

    setReport((currentReport) => ({
      ...currentReport,
      payload: {
        ...currentReport.payload,
        filters: filteredFilters,
      },
    }));
  };

  return (
    <div className="flex flex-col px-6">
      <span className="text-gray-500 mb-4 text-sm">Advanced filters</span>

      <div className="flex flex-col space-y-5">
        {Boolean(report.payload.filters?.length) && (
          <>
            {report.payload.filters?.map((filter, index) => (
              <div key={index} className="flex items-center space-x-5">
                <SelectField
                  label={t('column')}
                  value={filter.key}
                  onValueChange={(value) =>
                    handleChangeFilterColumn(value, index)
                  }
                  style={{ width: '11rem' }}
                >
                  {getFilteringColumns().map((key) => (
                    <option key={key} value={key}>
                      {t(getColumnWithoutEntityName(key, report))}
                    </option>
                  ))}
                </SelectField>

                <SelectField
                  label={t('operator')}
                  value={filter.operator}
                  onValueChange={(value) =>
                    handleChangeFilterOperator(index, value)
                  }
                  style={{ width: '11rem' }}
                >
                  {getFilterOperators(index).map((operator, index) => (
                    <option key={index} value={operator.value}>
                      {t(operator.label)}
                    </option>
                  ))}
                </SelectField>

                <div className="flex-1">
                  <InputField
                    label={t('value')}
                    value={filter.value}
                    onValueChange={(value) =>
                      handleChangeFilterValue(index, value)
                    }
                  />
                </div>

                <Icon
                  className="mt-6 cursor-pointer"
                  element={MdDelete}
                  size={22}
                  onClick={() => handleRemoveFilter(index)}
                />
              </div>
            ))}
          </>
        )}

        {internalFilter && (
          <div className="flex items-center space-x-5">
            <SelectField
              label={t('column')}
              value=""
              onValueChange={(value) => handleChangeFilterColumn(value, -1)}
              withBlank
              style={{ width: '11rem' }}
            >
              {getFilteringColumns().map((key) => (
                <option key={key} value={key}>
                  {t(getColumnWithoutEntityName(key, report))}
                </option>
              ))}
            </SelectField>

            <SelectField
              label={t('operator')}
              value={internalFilter.operator}
              onValueChange={(value) =>
                setInternalFilter(
                  (current) =>
                    current && {
                      ...current,
                      operator: value,
                    }
                )
              }
              style={{ width: '11rem' }}
            >
              {OPERATORS.string.map((operator, index) => (
                <option key={index} value={operator.value}>
                  {t(operator.label)}
                </option>
              ))}
            </SelectField>

            <div className="flex-1">
              <InputField
                label={t('value')}
                value={internalFilter.value}
                onValueChange={(value) =>
                  setInternalFilter(
                    (current) =>
                      current && {
                        ...current,
                        value,
                      }
                  )
                }
              />
            </div>

            <Icon
              className="mt-6 cursor-pointer"
              element={MdDelete}
              size={22}
              onClick={() => setInternalFilter(undefined)}
            />
          </div>
        )}

        {Boolean(!report.payload.filters?.length) && !internalFilter && (
          <span className="text-sm text-gray-500 self-center">
            No filters applied.
          </span>
        )}

        <Button
          onClick={(event: ChangeEvent<HTMLButtonElement>) => {
            event.preventDefault();
            !internalFilter && setInternalFilter(DEFAULT_FILTER);
          }}
        >
          <Icon element={MdAdd} color="white" />
          <span>Add filter</span>
        </Button>
      </div>
    </div>
  );
}
