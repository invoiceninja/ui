/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

interface Props {
  title: string;
  value: string;
}

export function Statistic(props: Props) {
  return (
    <div className="px-4 py-5 bg-white shadow rounded overflow-hidden sm:p-6">
      <dt className="text-sm font-medium text-gray-500 truncate">
        {props.title}
      </dt>
      <dd className="mt-1 text-3xl font-semibold text-gray-900">
        {props.value}
      </dd>
    </div>
  );
}
