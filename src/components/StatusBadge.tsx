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
import { useTranslation } from 'react-i18next';

interface Props {
  for: any;
  code: string | number;
  headless?: boolean;
}

export function StatusBadge(props: Props) {
  const [t] = useTranslation();

  return (
    <span
      className={classNames({
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800':
          !props.headless,
      })}
    >
      {t(props.for[props.code])}
    </span>
  );
}
