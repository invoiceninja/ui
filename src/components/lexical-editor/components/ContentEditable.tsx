/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import type { JSX } from 'react';

import '../css/ContentEditable.css';

import { ContentEditable } from '@lexical/react/LexicalContentEditable';

type Props = {
  className?: string;
  placeholderClassName?: string;
  placeholder: string;
};

export default function LexicalContentEditable({
  className,
  placeholder,
  placeholderClassName,
}: Props): JSX.Element {
  return (
    <ContentEditable
      className={className ?? 'ContentEditable__root'}
      aria-placeholder={placeholder}
      placeholder={
        <div className={placeholderClassName ?? 'ContentEditable__placeholder'}>
          {placeholder}
        </div>
      }
    />
  );
}
