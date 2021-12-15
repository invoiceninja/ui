/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { Settings } from 'components/layouts/Settings';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload } from './components';

export function Documents() {
  const [t] = useTranslation();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t('company')}: ${t(
      'documents'
    )}`;
  });

  return (
    <Settings title={t('documents')}>
      <Upload />
    </Settings>
  );
}
