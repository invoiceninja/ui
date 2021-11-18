/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

export function TableWrapper(props: { children: any }) {
  return (
    <div className="py-2 align-middle inline-block w-full mt-4">
      <div className="overflow-hidden border border-gray-300 sm:rounded-lg overflow-x-auto">
        {props.children}
      </div>
    </div>
  );
}
