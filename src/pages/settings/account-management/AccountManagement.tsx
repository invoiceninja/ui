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
import { EnabledModules, Integrations, Licence, Overview, Plan } from './component';

export function AccountManagement() {
  const [t] = useTranslation();

  useEffect(() => {
    document.title = `${import.meta.env.VITE_APP_TITLE}: ${t(
      'account_management'
    )}`;
  });

  return (
    <Settings title={t('account_management')}>
      <div className="space-y-6">
        <Plan />
        <Overview />
        <Licence />
        <Integrations />
        <EnabledModules />
      </div>
    </Settings>
  );
}
