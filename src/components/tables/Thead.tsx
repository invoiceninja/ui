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
import CommonProps from '../../common/interfaces/common-props.interface';

interface Props extends CommonProps {
  backgroundColor?: string;
}

export function Thead(props: Props) {
  const { backgroundColor } = props;

  const accentColor = useAccentColor();

  return (
    <thead style={{ backgroundColor: backgroundColor || accentColor }}>
      <tr>{props.children}</tr>
    </thead>
  );
}
