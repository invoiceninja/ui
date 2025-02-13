/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import reactStringReplace from 'react-string-replace';
import { Fragment, ReactNode } from 'react';

interface Replacements {
  [key: string]: ReactNode;
}

export function useReplaceVariables() {
  return (text: string, replacements: Replacements): ReactNode => {
    let result = text;

    for (const [variable, value] of Object.entries(replacements)) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      result = reactStringReplace(result, `:${variable}`, (match, i) => (
        <Fragment key={`${variable}-${i}`}>{value}</Fragment>
      ));
    }

    return Array.isArray(result) ? <Fragment>{result}</Fragment> : result;
  };
}
