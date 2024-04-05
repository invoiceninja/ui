/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useColorScheme } from '$app/common/colors';
import CommonProps from '$app/common/interfaces/common-props.interface';
import classNames from 'classnames';

interface Props extends CommonProps {
  withoutPadding?: boolean;
  borderColor?: string;
}

export function Divider(props: Props) {
  const colors = useColorScheme();

  return (
    <div
      style={{ borderColor: props.borderColor || colors.$4 }}
      className={classNames(
        'border-b',
        {
          'pt-6 mb-4 border-b': !props.withoutPadding,
        },
        props.className ?? ''
      )}
    ></div>
  );
}
