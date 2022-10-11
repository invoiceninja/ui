/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { trans } from 'common/helpers';
import { datatablePerPageAtom } from 'components/DataTable';
import { useAtom } from 'jotai';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { useTranslation } from 'react-i18next';
import CommonProps from '../../common/interfaces/common-props.interface';

interface Props extends CommonProps {
  totalPages: number;
  currentPage: number;
  onPageChange: any;
  onRowsChange: (rows: string) => any;
  totalRecords?: number;
}

const defaultProps: Props = {
  totalPages: 1,
  currentPage: 1,
  onPageChange: (page: number) => page,
  onRowsChange: (rows: string) => rows,
  totalRecords: 0,
};

export function Pagination(props: Props) {
  props = { ...defaultProps, ...props };

  const [t] = useTranslation();
  const [perPage] = useAtom(datatablePerPageAtom);

  const next = () => {
    if (props.currentPage + 1 <= props.totalPages) {
      props.onPageChange(props.currentPage + 1);
    }
  };

  const previous = () => {
    if (props.currentPage - 1 >= 1) {
      props.onPageChange(props.currentPage - 1);
    }
  };

  return (
    <div className="flex items-center justify-between space-x-2 my-3 overflow-y-auto pb-2">
      <div className="flex justify-center md:justify-start items-center space-x-4">
        {/* <span className="text-sm">Showing 1 to 1 of 1 entires</span> */}
        <div className="flex items-center space-x-2 flex-wrap">
          <select
            id="location"
            name="location"
            className="block pl-3 pr-10 py-2 text-base border-gray-300 sm:text-sm rounded-md"
            defaultValue={perPage}
            onChange={(element) => props.onRowsChange(element.target.value)}
          >
            <option value="10">10</option>
            <option>50</option>
            <option>100</option>
          </select>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700"
          >
            {t('rows')}
          </label>
        </div>
      </div>

      <p className="hidden lg:block text-sm font-medium text-gray-700">
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

      <nav className="flex justify-center md:justify-end my-4 md:my-0 items-center">
        <button
          onClick={previous}
          className="py-1.5 px-2 bg-white border-b border-t rounded-l hover:bg-gray-50 border"
        >
          <ChevronLeft />
        </button>

        <button
          onClick={next}
          className="py-1.5 px-2 bg-white border-b border-t border-r rounded-r hover:bg-gray-50"
        >
          <ChevronRight />
        </button>
      </nav>
    </div>
  );
}
