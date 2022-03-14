/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAccentColor } from 'common/hooks/useAccentColor';
import { ChevronLeft, ChevronRight } from 'react-feather';
import { useTranslation } from 'react-i18next';
import CommonProps from '../../common/interfaces/common-props.interface';

interface Props extends CommonProps {
  totalPages: number;
  currentPage: number;
  onPageChange: any;
  onRowsChange: (rows: string) => any;
}

const defaultProps: Props = {
  totalPages: 1,
  currentPage: 1,
  onPageChange: (page: number) => page,
  onRowsChange: (rows: string) => rows,
};

export function Pagination(props: Props) {
  props = { ...defaultProps, ...props };

  const [t] = useTranslation();
  const accentColor = useAccentColor();

  function next() {
    if (props.currentPage + 1 <= props.totalPages) {
      props.onPageChange(props.currentPage + 1);
    }
  }

  function previous() {
    if (props.currentPage - 1 >= 1) {
      props.onPageChange(props.currentPage - 1);
    }
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between space-x-2 my-3 overflow-y-auto pb-2">
      <div className="flex justify-center md:justify-start items-center space-x-4">
        {/* <span className="text-sm">Showing 1 to 1 of 1 entires</span> */}
        <div className="flex items-center space-x-2">
          <select
            id="location"
            name="location"
            className="block pl-3 pr-10 py-2 text-base border-gray-300 sm:text-sm rounded-md"
            defaultValue="10"
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
      <nav className="flex justify-center md:justify-end my-4 md:my-0 items-center">
        <button
          onClick={previous}
          className="py-1.5 px-2 bg-white border-b border-t rounded-l hover:bg-gray-50 border"
        >
          <ChevronLeft />
        </button>

        {[...Array(props.totalPages).keys()].map((number: number) => {
          return (
            <button
              key={number + 1}
              onClick={() => props.onPageChange(number + 1)}
              style={{
                backgroundColor:
                  props.currentPage === number + 1 ? accentColor : '',
                color: props.currentPage === number + 1 ? 'white' : '',
              }}
              className="py-1.5 px-4 bg-white border-b border-t hover:bg-gray-50"
            >
              {number + 1}
            </button>
          );
        })}

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
