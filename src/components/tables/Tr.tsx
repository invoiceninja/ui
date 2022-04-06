/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from 'classnames';
import CommonProps from '../../common/interfaces/common-props.interface';

interface Props extends CommonProps {
  isLoading?: boolean;
  onClick?: () => unknown;
}

export function Tr(props: Props) {
  return (
    <tr
      className={classNames('bg-white dark:bg-gray-800 hover:bg-gray-50', {
        'cursor-pointer': props.onClick,
      })}
      onClick={props.onClick}
    >
      {props.children}
    </tr>
  );
}
