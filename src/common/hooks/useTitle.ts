/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function useTitle(title: string, translate = true) {
  const [t] = useTranslation();

  const [documentTitle, setDocumentTitle] = useState(
    translate ? t(title) || '' : title
  );

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${documentTitle}`;
  }, [documentTitle]);

  return {
    documentTitle,
    setDocumentTitle,
  };
}
