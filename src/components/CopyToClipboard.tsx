/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { toast } from 'common/helpers/toast/toast';
import { MdOutlineContentCopy } from 'react-icons/md';

interface Props {
  text: string;
}

export function CopyToClipboard(props: Props) {
  const value = props.text || '';

  const handleClick = () => {
    navigator.clipboard.writeText(value);

    toast.success('copied_to_clipboard', { value: '' });
  };

  return (
    <div className="inline-flex space-x-2">
      <span>{value}</span>

      {value.length > 0 && (
        <button type="button" onClick={handleClick}>
          <MdOutlineContentCopy size={18} />
        </button>
      )}
    </div>
  );
}
