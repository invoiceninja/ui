/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from 'classnames';

interface Props {
  withoutPadding?: boolean;
}

export function Divider(props: Props) {
  return (
    <div
      className={classNames('border-b', {
        'pt-6 mb-4 border-b': !props.withoutPadding,
      })}
    ></div>
  );
}
