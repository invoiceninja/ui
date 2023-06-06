/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import CommonProps from '$app/common/interfaces/common-props.interface';
import classNames from 'classnames';

type BannerVariant = 'orange';

interface Props extends CommonProps {
  variant?: BannerVariant;
}

export function Banner(props: Props) {
  const { variant } = props;

  return (
    <div
      className={classNames(
        `flex justify-center items-center bg-orange-300 px-3.5 py-3.5 text-xs md:px-6 md:text-sm w-full leading-6 text-gray-900 ${props.className}`,
        {
          'bg-orange-300': !variant || variant === 'orange',
        }
      )}
    >
      {props.children}
    </div>
  );
}
