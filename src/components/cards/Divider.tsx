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
import classNames from 'classnames';

interface Props {
  withoutPadding?: boolean;
  borderColor?: string;
}

export function Divider(props: Props) {
  const colors = useColorScheme();

  return (
    <div
      style={{ borderColor: props.borderColor || colors.$4 }}
      className={classNames('border-b', {
        'pt-6 mb-4 border-b': !props.withoutPadding,
      })}
    ></div>
  );
}
