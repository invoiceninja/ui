/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CommonProps from '../../common/interfaces/common-props.interface';
import { useColorScheme } from '$app/common/colors';
import { SelectField } from '../forms';
import { PerPage } from '../DataTable';
import { ChevronLeft } from '../icons/ChevronLeft';
import { DoubleChevronLeft } from '../icons/DoubleChevronLeft';
import { ChevronRight } from '../icons/ChevronRight';
import { DoubleChevronRight } from '../icons/DoubleChevronRight';
import styled from 'styled-components';
import {
  getPageNavigationState,
  PageNavigationAction,
  resolvePageNavigation,
} from '$app/common/helpers/pagination';
import { PaginationMeta } from '$app/common/interfaces/generic-many-response';

const PaginationButton = styled.button`
  background-color: ${(props) => props.theme.backgroundColor};
  border-color: ${(props) => props.theme.borderColor};
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.hoverColor};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInput = styled.input`
  field-sizing: content;
  min-width: 3ch;
  background-color: transparent;
  border-color: ${(props) => props.theme.borderColor};
  color: ${(props) => props.theme.color};

  &:focus {
    border-color: ${(props) => props.theme.focusBorderColor};
  }
`;

interface Props extends CommonProps {
  totalPages: number;
  currentPage: number;
  onPageChange: any;
  currentPerPage?: PerPage;
  onRowsChange: (rows: PerPage) => any;
  totalRecords?: number;
  pagination?: PaginationMeta;
}

const defaultProps: Props = {
  totalPages: 1,
  currentPage: 1,
  currentPerPage: '10',
  onPageChange: (page: number) => page,
  onRowsChange: (rows: PerPage) => rows,
  totalRecords: 0,
};

export function Pagination(props: Props) {
  props = { ...defaultProps, ...props };

  const [t] = useTranslation();
  const colors = useColorScheme();

  const [pageInputValue, setPageInputValue] = useState<string>(
    String(props.currentPage)
  );

  useEffect(() => {
    setPageInputValue(String(props.currentPage));
  }, [props.currentPage]);

  const navigate = (action: PageNavigationAction) => {
    const page = resolvePageNavigation(action, {
      currentPage: props.currentPage,
      totalPages: props.totalPages,
      pagination: props.pagination,
    });

    if (page !== null) {
      props.onPageChange(page);
    }

    return page;
  };

  const { canPrevious, canNext } = getPageNavigationState({
    currentPage: props.currentPage,
    totalPages: props.totalPages,
    pagination: props.pagination,
  });

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === '') {
      setPageInputValue('');
      return;
    }

    const numericValue = value.replace(/[^0-9]/g, '');
    setPageInputValue(numericValue);
  };

  const handlePageInputBlur = () => {
    const pageNumber = parseInt(pageInputValue, 10);

    const page = !isNaN(pageNumber) ? navigate(pageNumber) : null;

    if (page === null) {
      setPageInputValue(String(props.currentPage));
    }
  };

  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-3 pb-2">
      {typeof props.totalRecords === 'number' && (
        <span className="text-sm font-medium">
          {t('total_results')}: {props.totalRecords}
        </span>
      )}

      <div
        className="flex justify-center space-x-4 items-center"
        style={{ color: colors.$3 }}
      >
        <div className="flex items-center">
          <PaginationButton
            type="button"
            className="p-2 sm:p-[0.725rem] border rounded-l-md shadow-sm"
            theme={{
              hoverColor: colors.$4,
              backgroundColor: colors.$1,
              borderColor: colors.$24,
            }}
            disabled={!canPrevious}
            data-cy="paginationFirstPage"
            onClick={() => navigate('first')}
          >
            <DoubleChevronLeft size="0.9rem" color={colors.$3} />
          </PaginationButton>

          <PaginationButton
            type="button"
            className="p-2 sm:p-[0.725rem] border-b border-t border-r rounded-r-md shadow-sm"
            theme={{
              hoverColor: colors.$4,
              backgroundColor: colors.$1,
              borderColor: colors.$24,
            }}
            disabled={!canPrevious}
            data-cy="paginationPreviousPage"
            onClick={() => navigate('previous')}
          >
            <ChevronLeft size="0.9rem" color={colors.$3} />
          </PaginationButton>
        </div>

        <div className="flex items-center space-x-1.5">
          <PageInput
            type="text"
            value={pageInputValue}
            onChange={handlePageInputChange}
            onBlur={handlePageInputBlur}
            onKeyDown={handlePageInputKeyDown}
            onFocus={(e) => e.target.select()}
            theme={{
              borderColor: colors.$24,
              focusBorderColor: colors.$3,
              color: colors.$3,
            }}
            className="h-8 text-sm font-medium text-center rounded-md border focus:outline-none focus:ring-0"
          />

          <span className="text-sm font-medium">/ {props.totalPages}</span>
        </div>

        <div className="flex">
          <PaginationButton
            type="button"
            className="p-2 sm:p-[0.725rem] border-t border-b border-l rounded-l-md shadow-sm"
            theme={{
              hoverColor: colors.$4,
              backgroundColor: colors.$1,
              borderColor: colors.$24,
            }}
            disabled={!canNext}
            data-cy="paginationNextPage"
            onClick={() => navigate('next')}
          >
            <ChevronRight size="0.9rem" color={colors.$3} />
          </PaginationButton>

          <PaginationButton
            type="button"
            className="p-2 sm:p-[0.725rem] border rounded-r-md shadow-sm"
            theme={{
              hoverColor: colors.$4,
              backgroundColor: colors.$1,
              borderColor: colors.$24,
            }}
            disabled={!canNext}
            data-cy="paginationLastPage"
            onClick={() => navigate('last')}
          >
            <DoubleChevronRight size="0.9rem" color={colors.$3} />
          </PaginationButton>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium" style={{ color: colors.$3 }}>
          {t('rows')}:
        </span>

        <SelectField
          className="shadow-sm"
          value={props.currentPerPage}
          onValueChange={(value) => props.onRowsChange(value as PerPage)}
          customSelector
          dismissable={false}
          searchable={false}
          dropdownIndicatorClassName="pl-0"
        >
          <option value="10">10</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </SelectField>
      </div>
    </div>
  );
}
