/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ReactNode } from 'react';
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

const PaginationButton = styled.div`
  background-color: ${(props) => props.theme.backgroundColor};
  border-color: ${(props) => props.theme.borderColor};

  &:hover {
    background-color: ${(props) => props.theme.hoverColor};
  }
`;

interface Props extends CommonProps {
  totalPages: number;
  currentPage: number;
  onPageChange: any;
  currentPerPage?: PerPage;
  onRowsChange: (rows: PerPage) => any;
  totalRecords?: number;
  leftSideChevrons?: ReactNode;
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

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= props.totalPages) {
      props.onPageChange(pageNumber);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-3 pb-2">
      {props.totalRecords && (
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
            className="p-2 sm:p-[0.725rem] border rounded-l-md shadow-sm cursor-pointer"
            theme={{
              hoverColor: colors.$4,
              backgroundColor: colors.$1,
              borderColor: colors.$5,
            }}
            onClick={() => goToPage(1)}
          >
            <DoubleChevronLeft size="0.9rem" color={colors.$3} />
          </PaginationButton>

          <PaginationButton
            className="p-2 sm:p-[0.725rem] border-b border-t border-r rounded-r-md shadow-sm cursor-pointer"
            theme={{
              hoverColor: colors.$4,
              backgroundColor: colors.$1,
              borderColor: colors.$5,
            }}
            onClick={() => goToPage(props.currentPage - 1)}
          >
            <ChevronLeft size="0.9rem" color={colors.$3} />
          </PaginationButton>
        </div>

        <span className="text-sm font-medium">
          {props.currentPage} / {props.totalPages}
        </span>

        <div className="flex">
          <PaginationButton
            className="p-2 sm:p-[0.725rem] border-t border-b border-l rounded-l-md shadow-sm cursor-pointer"
            theme={{
              hoverColor: colors.$4,
              backgroundColor: colors.$1,
              borderColor: colors.$5,
            }}
            onClick={() => goToPage(props.currentPage + 1)}
          >
            <ChevronRight size="0.9rem" color={colors.$3} />
          </PaginationButton>

          <PaginationButton
            className="p-2 sm:p-[0.725rem] border rounded-r-md shadow-sm cursor-pointer"
            theme={{
              hoverColor: colors.$4,
              backgroundColor: colors.$1,
              borderColor: colors.$5,
            }}
            onClick={() => goToPage(props.totalPages)}
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
          withoutSeparator
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
