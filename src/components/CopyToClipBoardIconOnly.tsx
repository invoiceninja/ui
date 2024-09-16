/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { toast } from '$app/common/helpers/toast/toast';
import { MouseEvent } from 'react';
import { MdOutlineContentCopy } from 'react-icons/md';

interface Props {
  text: string;
  className?: string;
  secure?: boolean;
  limit?: number;
  stopPropagation?: boolean;
  iconSize?: number;
  iconColor?: string;
}

export function CopyToClipboardIconOnly({
  text,
  className,
  secure,
  limit = 0,
  stopPropagation,
  iconSize,
  iconColor,
}: Props) {
  const value = text || '';

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    stopPropagation && event.stopPropagation();
    navigator.clipboard.writeText(value);
    toast.success('copied_to_clipboard', { value: '' });
  };

  return (
    <div className={`inline-flex space-x-2 ${className}`}>
      <span>
        {secure
          ? text.split('').map(() => '*')
          : value.length > limit
          ? value.substring(0, limit).concat(' ')
          : value}
      </span>

      {value.length > 0 && (
        <button type="button" onClick={handleClick}>
          <MdOutlineContentCopy size={iconSize ?? 18} color={iconColor} />
        </button>
      )}
    </div>
  );
}
