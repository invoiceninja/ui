/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAccentColor } from '$app/common/hooks/useAccentColor';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export function TFooter(props: Props) {
  const { children } = props;

  const accentColor = useAccentColor();

  return (
    <tfoot style={{ backgroundColor: accentColor }}>
      <tr>{children}</tr>
    </tfoot>
  );
}
