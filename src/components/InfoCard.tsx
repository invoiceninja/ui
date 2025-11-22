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
import { CSSProperties, ReactNode } from 'react';

interface Props {
  title: ReactNode;
  value?: ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  withoutTruncate?: boolean;
  withoutPadding?: boolean;
}

export function InfoCard(props: Props) {
  const colors = useColorScheme();

  return (
    <div
      className={classNames(
        'border shadow rounded overflow-auto space-y-2',
        {
          'px-4 py-5 sm:p-6': !props.withoutPadding,
        },
        props.className
      )}
      style={{
        backgroundColor: colors.$1,
        borderColor: colors.$5,
        ...props.style,
      }}
    >
      <dd className="text-xl font-medium">{props.title}</dd>
      <dt
        className={classNames('text-sm', {
          truncate: !props.withoutTruncate,
        })}
      >
        {props.value} {props.children}
      </dt>
    </div>
  );
}
