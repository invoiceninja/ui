/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import classNames from 'classnames';
import { MouseEvent } from 'react';
import { useColorScheme } from '$app/common/colors';
import { toast } from '$app/common/helpers/toast/toast';
import { CopyToClipboard } from './icons/CopyToClipboard';

interface Props {
  text: string;
  className?: string;
  secure?: boolean;
  limit?: number;
  iconColor?: string;
}

export function CopyToClipboardIconOnly({
  text,
  className,
  secure,
  limit = 0,
}: Props) {
  const value = text || '';
  const colors = useColorScheme();

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    navigator.clipboard.writeText(value);
    toast.success('copied_to_clipboard', { value: '' });
  };

  return (
    <div
      className={classNames(
        'inline-flex',
        {
          'space-x-2': Boolean(value && limit),
        },
        className
      )}
    >
      {Boolean(value) && (
        <span>
          {secure
            ? text.split('').map(() => '*')
            : value.length > limit
              ? value.substring(0, limit).concat(' ')
              : value}
        </span>
      )}

      {value.length > 0 && (
        <button type="button" onClick={handleClick}>
          <CopyToClipboard
            size="1.1rem"
            color={colors.$3}
            filledColor="transparent"
          />
        </button>
      )}
    </div>
  );
}
