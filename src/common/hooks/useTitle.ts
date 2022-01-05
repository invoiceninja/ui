/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useTitle(title: string, translate = true): void {
  const [t] = useTranslation();

  const [documentTitle] = useState(
    `${import.meta.env.VITE_APP_TITLE}: ${translate ? t(title) : title}`
  );

  useEffect(() => {
    document.title = documentTitle;
  }, [documentTitle]);
}
