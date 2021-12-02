/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import CommonProps from '../../common/interfaces/common-props.interface';

interface Props extends CommonProps {}

export function Table(props: Props) {
  return (
    <div className="flex flex-col mt-2">
      <div className="overflow-x-auto">
        <div className="py-2 align-middle inline-block min-w-full">
          <div className="overflow-hidden border border-gray-200 dark:border-transparent rounded border-b border-t">
            <table className="min-w-full divide-y divide-gray-200">
              {props.children}
            </table>
          </div>
        </div>
      </div>

      {/*  */}
    </div>
  );
}
