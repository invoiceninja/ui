/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Language } from 'common/interfaces/language';
import { useStaticsQuery } from 'common/queries/statics';
import { useEffect, useState } from 'react';

export function useLanguages(): Language[] {
  const { data: statics } = useStaticsQuery();
  const [languages, setLanguages] = useState<Language[]>([]);

  useEffect(() => {
    if (statics?.data?.languages) {
      setLanguages(statics.data.languages);
    }
  }, [statics]);

  return languages;
}
