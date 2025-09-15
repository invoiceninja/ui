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

import { LinkPlugin as LexicalLinkPlugin } from '@lexical/react/LexicalLinkPlugin';

import { validateUrl } from '../utils/url';

type Props = {
  hasLinkAttributes?: boolean;
};

export default function LinkPlugin({
  hasLinkAttributes = false,
}: Props): JSX.Element {
  return (
    <LexicalLinkPlugin
      validateUrl={validateUrl}
      attributes={
        hasLinkAttributes
          ? {
              rel: 'noopener noreferrer',
              target: '_blank',
            }
          : undefined
      }
    />
  );
}
