/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from "classnames";
import { useDispatch } from "react-redux";
import { updateCurrentPage } from "../../common/stores/slices/products";

interface Props {
  currentPage: number;
  totalPages: number;
}

export function Pagination(props: Props) {
  const dispatch = useDispatch();

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex sm:justify-end">
        <div>
          <nav
            className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
            aria-label="Pagination"
          >
            {[...Array(props.totalPages).keys()].map((i) => (
              <button
                key={i + 1}
                onClick={() => dispatch(updateCurrentPage({ number: i + 1 }))}
                aria-current="page"
                className={classNames(
                  "relative inline-flex items-center px-4 py-2 border text-sm font-medium ",
                  {
                    "z-10 bg-indigo-50 border-indigo-500 text-indigo-600":
                      props.currentPage === i + 1,
                    "bg-white border-gray-300 text-gray-500 hover:bg-gray-50":
                      props.currentPage !== i + 1,
                  }
                )}
              >
                {i + 1}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
