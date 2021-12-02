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

interface Props extends CommonProps {
  isLoading?: boolean;
}

export function Tr(props: Props) {
  return (
    <tr className="bg-white dark:bg-gray-800 hover:bg-gray-50">
      {props.children}
    </tr>
  );
}
