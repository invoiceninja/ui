/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { IconType } from 'react-icons';
import { Icon as ReactFeatherIcon } from 'react-feather';
import { Icon } from './icons/Icon';
import { Button } from './forms';

interface Props {
  onClick: () => void;
  icon: IconType | ReactFeatherIcon;
  label: string;
}

export function CloneOption(props: Props) {
  const { onClick, icon, label } = props;

  return (
    <Button
      behavior="button"
      type="secondary"
      className="w-3/4"
      onClick={onClick}
    >
      <Icon element={icon} style={{ width: '1.1rem', height: '1.1rem' }} />
      <span>{label}</span>
    </Button>
  );
}
