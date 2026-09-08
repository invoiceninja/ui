/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { ReactElement } from 'react';
import { Icon as ReactFeatherIcon } from 'react-feather';
import { IconType } from 'react-icons';
import { Button } from './forms';
import { Icon } from './icons/Icon';

interface Props {
  onClick: () => void;
  icon?: IconType | ReactFeatherIcon;
  label: string;
  iconElement?: ReactElement;
  className?: string;
}

export function CloneOption({
  onClick,
  icon,
  label,
  iconElement,
  className,
}: Props) {
  return (
    <Button
      behavior="button"
      type="secondary"
      className="w-3/4"
      onClick={onClick}
    >
      {icon ? (
        <Icon element={icon} style={{ width: '1.1rem', height: '1.1rem' }} />
      ) : (
        iconElement
      )}

      <span>{label}</span>
    </Button>
  );
}
