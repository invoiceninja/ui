/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
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
  const { onClick, innerRef, ...otherProps } = props;

  return (
    <tr
      className={classNames('bg-white dark:bg-gray-800 hover:bg-gray-50', {
        'cursor-pointer': onClick,
      })}
      onClick={(event) =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        props.onClick && event.target?.nodeName === 'TD'
          ? props.onClick()
          : null
      }
      ref={innerRef}
      {...otherProps}
    >
      {props.children}
    </tr>
  );
}
