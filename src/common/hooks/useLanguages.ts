/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Language } from '$app/common/interfaces/language';
import { useStaticsQuery } from '$app/common/queries/statics';
import { useEffect, useState } from 'react';

export function useLanguages(): Language[] {
  const { data: statics } = useStaticsQuery();
  const [languages, setLanguages] = useState<Language[]>([]);

  useEffect(() => {
    if (statics?.languages) {
      setLanguages(statics.languages);
    }
  }, [statics]);

  return languages;
}
