/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @copyright Copyright (c) 2021. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

import { useTitle } from 'common/hooks/useTitle';
import { Default } from 'components/layouts/Default';
import { useTranslation } from 'react-i18next';
import { Client } from './components/Client';

export function Create() {
  const [t] = useTranslation();

  useTitle('new_invoice');

  return (
    <Default title={t('new_invoice')}>
      <div className="grid grid-cols-12 gap-4">
        <Client />
      </div>
    </Default>
  );
}
