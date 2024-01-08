/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { trans } from '$app/common/helpers';
import { ReactNode } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'react-feather';
import { useTranslation } from 'react-i18next';
import CommonProps from '../../common/interfaces/common-props.interface';
import { useColorScheme } from '$app/common/colors';
import { SelectField } from '../forms';
import { PerPage } from '../DataTable';

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

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= props.totalPages) {
      props.onPageChange(pageNumber);
    }
  };

  const colors = useColorScheme();

  return (
    <div className="flex items-center justify-between space-x-2 my-3 overflow-y-auto pb-2">
      <div className="flex justify-center md:justify-start items-center space-x-4">
        <div className="flex items-center space-x-2 flex-wrap">
          <SelectField
            value={props.currentPerPage}
            onValueChange={(value) => props.onRowsChange(value as PerPage)}
          >
            <option value="10">10</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </SelectField>

          <label
            htmlFor="location"
            className="block text-sm font-medium"
            style={{ color: colors.$3 }}
          >
            {t('rows')}
          </label>
        </div>
      </div>

      <p
        className="hidden lg:block text-sm font-medium"
        style={{ color: colors.$3 }}
      >
        {trans('pdf_page_info', {
          current: props.currentPage,
          total: props.totalPages,
        })}
        .
        {props.totalRecords && (
          <span className="ml-1">
            {t('total_results')}: {props.totalRecords}
          </span>
        )}
      </p>

      <nav
        className="flex justify-center md:justify-end my-4 md:my-0 items-center"
        style={{ color: colors.$3 }}
      >
        {props.leftSideChevrons}

        <button
          onClick={() => goToPage(1)}
          className="py-1.5 px-2  border rounded-l"
          style={{ backgroundColor: colors.$1, borderColor: colors.$5 }}
        >
          <ChevronsLeft />
        </button>

        <button
          onClick={() => goToPage(props.currentPage - 1)}
          className="py-1.5 px-2 bg-white border-b border-t border-r hover:bg-gray-50"
          style={{ backgroundColor: colors.$1, borderColor: colors.$5 }}
        >
          <ChevronLeft />
        </button>

        <button
          data-cy="dataTableChevronRight"
          onClick={() => goToPage(props.currentPage + 1)}
          className="py-1.5 px-2 bg-white border-b border-t border-r hover:bg-gray-50"
          style={{ backgroundColor: colors.$1, borderColor: colors.$5 }}
        >
          <ChevronRight />
        </button>

        <button
          onClick={() => goToPage(props.totalPages)}
          className="py-1.5 px-2 bg-white border-b border-t border-r hover:bg-gray-50 rounded-r"
          style={{ backgroundColor: colors.$1, borderColor: colors.$5 }}
        >
          <ChevronsRight />
        </button>
      </nav>
    </div>
  );
}
