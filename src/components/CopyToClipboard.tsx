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
import { MouseEvent, useState } from 'react';
import { MdOutlineContentCopy } from 'react-icons/md';
import { AiFillEyeInvisible } from 'react-icons/ai';
import { AiFillEye } from 'react-icons/ai';
import { Icon } from './icons/Icon';

interface Props {
  text: string;
  className?: string;
  secure?: boolean;
}

export function CopyToClipboard(props: Props) {
  const value = props.text || '';

  const [isSecureVisible, setIsSecureVisible] = useState<boolean>(false);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    navigator.clipboard.writeText(value);
    toast.success('copied_to_clipboard', { value: '' });
  };

  return (
    <div className={`inline-flex items-center space-x-2 ${props.className}`}>
      <span>
        {props.secure && !isSecureVisible
          ? props.text.split('').map(() => '*')
          : value}
      </span>

      {value.length > 0 && navigator.clipboard && window.isSecureContext ? (
        <button type="button" onClick={handleClick}>
          <MdOutlineContentCopy size={18} />
        </button>
      ) : (
        <>
          {Boolean(props.secure) && (
            <div
              className="inline-flex items-center cursor-pointer"
              onClick={(event) => {
                event.stopPropagation();
                setIsSecureVisible((current) => !current);
              }}
            >
              {isSecureVisible ? (
                <Icon element={AiFillEye} />
              ) : (
                <Icon element={AiFillEyeInvisible} />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
