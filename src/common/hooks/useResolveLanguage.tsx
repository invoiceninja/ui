/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useLanguages } from './useLanguages';

export function useResolveLanguage() {
  const langauges = useLanguages();

  return (id: string | number) => {
    return langauges.find(
      (language) => language.id.toString() === id.toString()
    );
  };
}
