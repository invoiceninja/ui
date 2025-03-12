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
import { useColorScheme } from '$app/common/colors';

interface Props extends CommonProps {
  isLoading?: boolean;
  onClick?: () => unknown;
  backgroundColor?: string;
}

export function Tr(props: Props) {
  const { onClick, innerRef, backgroundColor, ...otherProps } = props;
  const colors = useColorScheme();

  return (
    <tr
      style={{
        backgroundColor: backgroundColor || colors.$1,
        ...props.style,
      }}
      onClick={(event) =>
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        props.onClick && event.target?.nodeName === 'TD'
          ? props.onClick()
          : null
      }
      ref={innerRef}
      {...otherProps}
      className={classNames(`${props.className}`, {
        'cursor-pointer': onClick,
      })}
      tabIndex={props.tabIndex}
    >
      {props.children}
    </tr>
  );
}
