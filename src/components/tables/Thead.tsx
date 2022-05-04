/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useAccentColor } from 'common/hooks/useAccentColor';
import CommonProps from '../../common/interfaces/common-props.interface';

type Props = CommonProps;

export function Thead(props: Props) {
  const accentColor = useAccentColor();

  return (
    <thead style={{ backgroundColor: accentColor }}>
      <tr>{props.children}</tr>
    </thead>
  );
}
