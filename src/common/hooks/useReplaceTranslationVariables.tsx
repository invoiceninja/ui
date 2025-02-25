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
import { Fragment, ReactNode, isValidElement } from 'react';

interface Replacements {
  [key: string]: ReactNode;
}

export function useReplaceVariables() {
  const isValidReplacement = (value: ReactNode): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return true;
    if (typeof value === 'number') return true;
    if (typeof value === 'boolean') return true;

    if (isValidElement(value)) return true;

    return false;
  };

  const sanitizeValue = (value: ReactNode): ReactNode => {
    if (!isValidReplacement(value)) {
      return '';
    }

    return value;
  };

  return (text: string, replacements: Replacements): ReactNode => {
    try {
      if (typeof text !== 'string') {
        return '';
      }

      let result: string | ReactNode[] = text;

      for (const [variable, value] of Object.entries(replacements)) {
        const safeValue = sanitizeValue(value);

        result = reactStringReplace(result, `:${variable}`, (_, i) => (
          <Fragment key={`${variable}-${i}`}>{safeValue}</Fragment>
        ));
      }

      return Array.isArray(result) ? <Fragment>{result}</Fragment> : result;
    } catch (error) {
      return text;
    }
  };
}
