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
import { Card } from '$app/components/cards';
import classNames from 'classnames';
import { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
  description?: string;
  className?: string;
  height?: number;
}

export function AnalyticsCard({
  title,
  children,
  description,
  className,
  height = 320,
}: Props) {
  const colors = useColorScheme();

  return (
    <Card
      title={title}
      description={description}
      className={classNames('shadow-sm', className)}
      headerClassName="px-3 sm:px-4 py-3"
      childrenClassName="px-4 pb-4"
      style={{ borderColor: colors.$24 }}
      headerStyle={{ borderColor: colors.$20 }}
      withoutHeaderPadding
    >
      <div style={{ height }}>{children}</div>
    </Card>
  );
}
