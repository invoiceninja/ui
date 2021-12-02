/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings } from '../../../components/layouts/Settings';

export function WorkflowSettings() {
  const [t] = useTranslation();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'workflow_settings'
    )}`;
  });

  return (
    <Settings title={t('workflow_settings')}>
      <div className="space-y-6 mt-6"></div>
    </Settings>
  );
}
