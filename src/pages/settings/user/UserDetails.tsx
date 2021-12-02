/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTranslation } from 'react-i18next';
import { Settings } from '../../../components/layouts/Settings';
import { Details } from './components/Details';
import { Password } from './components/Password';

export function UserDetails() {
  const [t] = useTranslation();

  return (
    <Settings title={t('user_details')}>
      <div className="space-y-6 mt-6">
        <Details />
        <Password />
      </div>
    </Settings>
  );
}
